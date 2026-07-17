export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const { startMeetingSyncScheduler } = await import(
        "./app/lib/integrations/startMeetingSyncScheduler"
    );
    startMeetingSyncScheduler();
}
