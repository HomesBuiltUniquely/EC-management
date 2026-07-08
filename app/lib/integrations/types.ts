export type MeetingSource = "crm" | "design";

export type ExternalMeetingListItem = {
    appointmentId: number;
    createdAt: string;
    leadId: string;
    designerName: string;
    crmName?: string;
    clientName: string;
    milestoneName?: string;
    slots: string;
    meetingDate: string;
    branch?: string;
};

export type SyncSourceResult = {
    source: MeetingSource;
    fetched: number;
    upserted: number;
    since: string;
    checkpoint: string;
    error?: string;
};

export type SyncMeetingsResult = {
    ok: true;
    ranAt: string;
    crm: SyncSourceResult;
    design: SyncSourceResult;
};
