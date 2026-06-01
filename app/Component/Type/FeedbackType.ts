export type Rating4 = "Excellent" | "Good" | "Average" | "Poor";

export type ConfidenceLevel =
    | "Very Confident"
    | "Somewhat Confident"
    | "Neutral"
    | "Not Confident";

export type ListenLevel = "Yes" | "Sometimes" | "Rarely" | "Never";

export type SatisfactionLevel =
    | "Very Satisfied"
    | "Satisfied"
    | "Neutral"
    | "Dissatisfied";

export type ComfortLevel =
    | "Yes, completely"
    | "To some extent"
    | "Not really"
    | "Not at all";

export type TransparencyLevel =
    | "Very Transparent"
    | "Somewhat Transparent"
    | "Neutral"
    | "Not Transparent";

export type QueriesLevel = "All of them" | "Most of them" | "Few of them" | "None";

export type MeetingFeedbackInput = {
    customerName?: string;
    visitDate: string;
    designerName?: string;
    salesRepName?: string;
    designerUnderstand: Rating4;
    designerExplain: Rating4;
    designerConfidence: ConfidenceLevel;
    designerListen: ListenLevel;
    designerOverall: SatisfactionLevel;
    designTeamSuggestions?: string;
    salesExplainProcess: Rating4;
    salesComfort: ComfortLevel;
    salesTransparent: TransparencyLevel;
    salesQueries: QueriesLevel;
    salesOverall: Rating4;
    salesTeamFeedback?: string;
    recommendScore: number;
    followUpWanted: "yes" | "no";
    followUpPhone?: string;
};

export type MeetingFeedbackRecord = MeetingFeedbackInput & {
    id: string;
    roomId: number;
    roomName: string;
    leadName: string;
    completedAt: number;
    dateKey: string;
};

export function validateFeedback(input: MeetingFeedbackInput): string | null {
    const requiredRatings = [
        input.designerUnderstand,
        input.designerExplain,
        input.designerConfidence,
        input.designerListen,
        input.designerOverall,
        input.salesExplainProcess,
        input.salesComfort,
        input.salesTransparent,
        input.salesQueries,
        input.salesOverall,
    ];
    if (requiredRatings.some((v) => !v)) {
        return "Please answer all rating questions.";
    }
    if (
        input.recommendScore === undefined ||
        input.recommendScore < 0 ||
        input.recommendScore > 10
    ) {
        return "Please select a recommendation score from 0 to 10.";
    }
    if (!input.followUpWanted) {
        return "Please indicate if you want a follow-up call.";
    }
    if (input.followUpWanted === "yes" && !input.followUpPhone?.trim()) {
        return "Please enter a contact number for follow-up.";
    }
    return null;
}
