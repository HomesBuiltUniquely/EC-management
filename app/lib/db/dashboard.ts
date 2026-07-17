import type { RowDataPacket } from "mysql2";
import type { MeetingFeedbackRecord } from "../../Component/Type/FeedbackType";
import {
    getDefaultFloorRooms,
    type FloorRoom,
} from "../../Component/Type/FloorRoomType";
import type {
    CompletedMeeting,
    ScheduledMeeting,
    WalkInRecord,
} from "../../Component/Type/VisitType";
import { normalizeRequirements } from "../../Component/Type/WalkInFormConfig";
import { ensureSchema, getPool, withTransaction } from "../mysql";
import { deleteIdsNotIn, deleteManualWalkInsNotIn, placeholders } from "./sqlHelpers";
import type { EcBranch } from "../branches";

export type DashboardData = {
    rooms: FloorRoom[];
    walkIns: WalkInRecord[];
    scheduled: ScheduledMeeting[];
    completed: CompletedMeeting[];
    feedbacks: MeetingFeedbackRecord[];
};

type WalkInRow = RowDataPacket & {
    id: string;
    designer: string;
    form_date: string;
    name: string;
    email: string;
    phone: string;
    alternate_phone: string | null;
    expected_move_in: string | null;
    residing_address: string | null;
    property_name: string | null;
    property_address: string | null;
    property_type: string | null;
    property_use: string | null;
    budget: string;
    possession: string | null;
    requirements: unknown;
    interest: string;
    arrived_at: number;
    date_key: string;
    status: string;
    assigned_room_id: number | null;
    assigned_room_name: string | null;
    is_scheduled: number;
    schedule_time: string | null;
    schedule_end: string | null;
    source: string | null;
    external_appointment_id: number | null;
    lead_id: string | null;
    crm_name: string | null;
    milestone_name: string | null;
    branch: string | null;
    visit_type: string | null;
};

function parseJsonPayload<T>(value: unknown): T {
    if (typeof value === "string") {
        return JSON.parse(value) as T;
    }
    return value as T;
}

function walkInFromRow(row: WalkInRow): WalkInRecord {
    return {
        id: row.id,
        designer: row.designer,
        formDate: row.form_date,
        name: row.name,
        email: row.email,
        phone: row.phone,
        alternatePhone: row.alternate_phone ?? undefined,
        expectedMoveIn: row.expected_move_in ?? undefined,
        residingAddress: row.residing_address ?? undefined,
        propertyName: row.property_name ?? undefined,
        propertyAddress: row.property_address ?? undefined,
        propertyType: row.property_type ?? undefined,
        propertyUse: row.property_use ?? undefined,
        budget: row.budget,
        possession: row.possession ?? undefined,
        requirements: normalizeRequirements(
            parseJsonPayload(row.requirements) as WalkInRecord["requirements"]
        ),
        interest: row.interest,
        arrivedAt: Number(row.arrived_at),
        dateKey: row.date_key,
        status: row.status as WalkInRecord["status"],
        assignedRoomId: row.assigned_room_id ?? undefined,
        assignedRoomName: row.assigned_room_name ?? undefined,
        isScheduled: Boolean(row.is_scheduled),
        scheduleTime: row.schedule_time ?? undefined,
        scheduleEnd: row.schedule_end ?? undefined,
        source: (row.source as WalkInRecord["source"]) ?? undefined,
        externalAppointmentId: row.external_appointment_id ?? undefined,
        leadId: row.lead_id ?? undefined,
        crmName: row.crm_name ?? undefined,
        milestoneName: row.milestone_name ?? undefined,
        branch: row.branch ?? undefined,
        visitType: row.visit_type ?? undefined,
    };
}

export async function loadDashboardFromDb(branch: EcBranch): Promise<DashboardData> {
    await ensureSchema();
    const pool = getPool();

    const [roomRows] = await pool.query<RowDataPacket[]>(
        "SELECT id, payload FROM floor_rooms WHERE branch = ? ORDER BY id ASC",
        [branch]
    );
    const [walkInRows] = await pool.query<WalkInRow[]>(
        "SELECT * FROM walk_ins WHERE branch = ? ORDER BY arrived_at DESC",
        [branch]
    );
    const [scheduledRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM scheduled_meetings WHERE branch = ?",
        [branch]
    );
    const [completedRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM completed_meetings WHERE branch = ?",
        [branch]
    );
    const [feedbackRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM meeting_feedbacks WHERE branch = ?",
        [branch]
    );

    let rooms: FloorRoom[];
    if (roomRows.length === 0) {
        rooms = getDefaultFloorRooms(branch);
        for (const room of rooms) {
            await pool.query(
                `INSERT INTO floor_rooms (branch, id, payload) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE payload = VALUES(payload)`,
                [branch, room.id, JSON.stringify(room)]
            );
        }
    } else {
        rooms = roomRows.map((r) =>
            parseJsonPayload<FloorRoom>(r.payload)
        );
    }

    return {
        rooms,
        walkIns: walkInRows.map(walkInFromRow),
        scheduled: scheduledRows.map((r) => ({
            id: r.id as string,
            leadName: r.lead_name as string,
            withName: (r.with_name as string) || undefined,
            roomName: (r.room_name as string) || undefined,
            startT: r.start_t as string,
            endT: r.end_t as string,
            scheduledAt: Number(r.scheduled_at),
            dateKey: r.date_key as string,
            confirmed: Boolean(r.confirmed),
            walkInId: (r.walk_in_id as string) || undefined,
        })),
        completed: completedRows.map((r) => ({
            id: r.id as string,
            roomName: r.room_name as string,
            leadName: r.lead_name as string,
            withName: (r.with_name as string) || undefined,
            completedAt: Number(r.completed_at),
            dateKey: r.date_key as string,
        })),
        feedbacks: feedbackRows.map((r) => ({
            id: r.id as string,
            roomId: r.room_id as number,
            roomName: r.room_name as string,
            leadName: r.lead_name as string,
            completedAt: Number(r.completed_at),
            dateKey: r.date_key as string,
            customerName: (r.customer_name as string) || undefined,
            visitDate: r.visit_date as string,
            designerName: (r.designer_name as string) || undefined,
            salesRepName: (r.sales_rep_name as string) || undefined,
            designerUnderstand:
                r.designer_understand as MeetingFeedbackRecord["designerUnderstand"],
            designerExplain:
                r.designer_explain as MeetingFeedbackRecord["designerExplain"],
            designerConfidence:
                r.designer_confidence as MeetingFeedbackRecord["designerConfidence"],
            designerListen:
                r.designer_listen as MeetingFeedbackRecord["designerListen"],
            designerOverall:
                r.designer_overall as MeetingFeedbackRecord["designerOverall"],
            designTeamSuggestions:
                (r.design_team_suggestions as string) || undefined,
            salesExplainProcess:
                r.sales_explain_process as MeetingFeedbackRecord["salesExplainProcess"],
            salesComfort:
                r.sales_comfort as MeetingFeedbackRecord["salesComfort"],
            salesTransparent:
                r.sales_transparent as MeetingFeedbackRecord["salesTransparent"],
            salesQueries:
                r.sales_queries as MeetingFeedbackRecord["salesQueries"],
            salesOverall:
                r.sales_overall as MeetingFeedbackRecord["salesOverall"],
            salesTeamFeedback:
                (r.sales_team_feedback as string) || undefined,
            recommendScore: r.recommend_score as number,
            followUpWanted: r.follow_up_wanted as "yes" | "no",
            followUpPhone: (r.follow_up_phone as string) || undefined,
        })),
    };
}

export async function saveDashboardToDb(
    branch: EcBranch,
    data: DashboardData
): Promise<void> {
    await ensureSchema();

    await withTransaction(async (conn) => {
        for (const room of data.rooms) {
            await conn.query(
                `INSERT INTO floor_rooms (branch, id, payload) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE payload = VALUES(payload)`,
                [branch, room.id, JSON.stringify(room)]
            );
        }

        await deleteManualWalkInsNotIn(
            conn,
            data.walkIns.map((w) => w.id),
            branch
        );

        const walkInPh = placeholders(32);
        for (const w of data.walkIns) {
            await conn.query(
                `INSERT INTO walk_ins (
                  id, designer, form_date, name, email, phone, alternate_phone,
                  expected_move_in, residing_address, property_name, property_address,
                  property_type, property_use, budget, possession, requirements, interest,
                  arrived_at, date_key, \`status\`, assigned_room_id, assigned_room_name,
                  is_scheduled, schedule_time, schedule_end,
                  source, external_appointment_id, lead_id, crm_name, milestone_name, branch, visit_type
                ) VALUES (${walkInPh})
                ON DUPLICATE KEY UPDATE
                  designer=VALUES(designer), form_date=VALUES(form_date), name=VALUES(name),
                  email=VALUES(email), phone=VALUES(phone), alternate_phone=VALUES(alternate_phone),
                  expected_move_in=VALUES(expected_move_in), residing_address=VALUES(residing_address),
                  property_name=VALUES(property_name), property_address=VALUES(property_address),
                  property_type=VALUES(property_type), property_use=VALUES(property_use),
                  budget=VALUES(budget), possession=VALUES(possession), requirements=VALUES(requirements),
                  interest=VALUES(interest), arrived_at=VALUES(arrived_at), date_key=VALUES(date_key),
                  \`status\`=VALUES(\`status\`), assigned_room_id=VALUES(assigned_room_id),
                  assigned_room_name=VALUES(assigned_room_name), is_scheduled=VALUES(is_scheduled),
                  schedule_time=VALUES(schedule_time), schedule_end=VALUES(schedule_end),
                  source=VALUES(source), external_appointment_id=VALUES(external_appointment_id),
                  lead_id=VALUES(lead_id), crm_name=VALUES(crm_name), milestone_name=VALUES(milestone_name),
                  branch=VALUES(branch), visit_type=VALUES(visit_type)`,
                [
                    w.id,
                    w.designer,
                    w.formDate,
                    w.name,
                    w.email,
                    w.phone,
                    w.alternatePhone ?? null,
                    w.expectedMoveIn ?? null,
                    w.residingAddress ?? null,
                    w.propertyName ?? null,
                    w.propertyAddress ?? null,
                    w.propertyType ?? null,
                    w.propertyUse ?? null,
                    w.budget,
                    w.possession ?? null,
                    JSON.stringify(w.requirements),
                    w.interest,
                    w.arrivedAt,
                    w.dateKey,
                    w.status,
                    w.assignedRoomId ?? null,
                    w.assignedRoomName ?? null,
                    w.isScheduled ? 1 : 0,
                    w.scheduleTime ?? null,
                    w.scheduleEnd ?? null,
                    w.source ?? null,
                    w.externalAppointmentId ?? null,
                    w.leadId ?? null,
                    w.crmName ?? null,
                    w.milestoneName ?? null,
                    branch,
                    w.visitType ?? null,
                ]
            );
        }

        await deleteIdsNotIn(
            conn,
            "scheduled_meetings",
            "id",
            data.scheduled.map((s) => s.id),
            branch
        );

        const scheduledPh = placeholders(11);
        for (const s of data.scheduled) {
            await conn.query(
                `INSERT INTO scheduled_meetings (
                  id, branch, lead_name, with_name, room_name, start_t, end_t,
                  scheduled_at, date_key, confirmed, walk_in_id
                ) VALUES (${scheduledPh})
                ON DUPLICATE KEY UPDATE
                  lead_name=VALUES(lead_name), with_name=VALUES(with_name),
                  room_name=VALUES(room_name), start_t=VALUES(start_t), end_t=VALUES(end_t),
                  scheduled_at=VALUES(scheduled_at), date_key=VALUES(date_key),
                  confirmed=VALUES(confirmed), walk_in_id=VALUES(walk_in_id)`,
                [
                    s.id,
                    branch,
                    s.leadName,
                    s.withName ?? null,
                    s.roomName ?? null,
                    s.startT,
                    s.endT,
                    s.scheduledAt,
                    s.dateKey,
                    s.confirmed ? 1 : 0,
                    s.walkInId ?? null,
                ]
            );
        }

        await deleteIdsNotIn(
            conn,
            "completed_meetings",
            "id",
            data.completed.map((c) => c.id),
            branch
        );

        const completedPh = placeholders(7);
        for (const c of data.completed) {
            await conn.query(
                `INSERT INTO completed_meetings (
                  id, branch, room_name, lead_name, with_name, completed_at, date_key
                ) VALUES (${completedPh})
                ON DUPLICATE KEY UPDATE
                  room_name=VALUES(room_name), lead_name=VALUES(lead_name),
                  with_name=VALUES(with_name), completed_at=VALUES(completed_at),
                  date_key=VALUES(date_key)`,
                [
                    c.id,
                    branch,
                    c.roomName,
                    c.leadName,
                    c.withName ?? null,
                    c.completedAt,
                    c.dateKey,
                ]
            );
        }

        await deleteIdsNotIn(
            conn,
            "meeting_feedbacks",
            "id",
            data.feedbacks.map((f) => f.id),
            branch
        );

        const feedbackPh = placeholders(26);
        for (const f of data.feedbacks) {
            await conn.query(
                `INSERT INTO meeting_feedbacks (
                  id, branch, room_id, room_name, lead_name, completed_at, date_key,
                  customer_name, visit_date, designer_name, sales_rep_name,
                  designer_understand, designer_explain, designer_confidence,
                  designer_listen, designer_overall, design_team_suggestions,
                  sales_explain_process, sales_comfort, sales_transparent,
                  sales_queries, sales_overall, sales_team_feedback,
                  recommend_score, follow_up_wanted, follow_up_phone
                ) VALUES (${feedbackPh})
                ON DUPLICATE KEY UPDATE
                  room_id=VALUES(room_id), room_name=VALUES(room_name),
                  lead_name=VALUES(lead_name), completed_at=VALUES(completed_at),
                  date_key=VALUES(date_key), customer_name=VALUES(customer_name),
                  visit_date=VALUES(visit_date), designer_name=VALUES(designer_name),
                  sales_rep_name=VALUES(sales_rep_name),
                  designer_understand=VALUES(designer_understand),
                  designer_explain=VALUES(designer_explain),
                  designer_confidence=VALUES(designer_confidence),
                  designer_listen=VALUES(designer_listen),
                  designer_overall=VALUES(designer_overall),
                  design_team_suggestions=VALUES(design_team_suggestions),
                  sales_explain_process=VALUES(sales_explain_process),
                  sales_comfort=VALUES(sales_comfort),
                  sales_transparent=VALUES(sales_transparent),
                  sales_queries=VALUES(sales_queries),
                  sales_overall=VALUES(sales_overall),
                  sales_team_feedback=VALUES(sales_team_feedback),
                  recommend_score=VALUES(recommend_score),
                  follow_up_wanted=VALUES(follow_up_wanted),
                  follow_up_phone=VALUES(follow_up_phone)`,
                [
                    f.id,
                    branch,
                    f.roomId,
                    f.roomName,
                    f.leadName,
                    f.completedAt,
                    f.dateKey,
                    f.customerName ?? null,
                    f.visitDate,
                    f.designerName ?? null,
                    f.salesRepName ?? null,
                    f.designerUnderstand,
                    f.designerExplain,
                    f.designerConfidence,
                    f.designerListen,
                    f.designerOverall,
                    f.designTeamSuggestions ?? null,
                    f.salesExplainProcess,
                    f.salesComfort,
                    f.salesTransparent,
                    f.salesQueries,
                    f.salesOverall,
                    f.salesTeamFeedback ?? null,
                    f.recommendScore,
                    f.followUpWanted,
                    f.followUpPhone ?? null,
                ]
            );
        }
    });
}
