import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default async function (eventProcessor: any, router: AppRouterInstance, params: any, minPollingRate: number) {
    const roomState = eventProcessor.state;

    const res = await fetch("/api/room/sync", {
        method: "POST",
        body: JSON.stringify({
            state_id: roomState.id,
            queue: eventProcessor.queue,
            hashes: eventProcessor.handledHashes
        })
    })

    const data = await res.json();

    if (res.status != 200) return router.push("/");

    if (roomState.id == -1) {
        eventProcessor.messages.push({
            id: 0,
            time: new Date().toTimeString().slice(0, 5),
            type: "medium_italic_green",
            content: "Joined " + params.id,
        });
    }

    eventProcessor.state.id = data.state_id;

    for (const event of data.events) {
        eventProcessor.process(event, eventProcessor);
    }

    const timeSinceSync = Date.now() - roomState.lastUpdate;

    if (timeSinceSync < minPollingRate) await new Promise((resolve) => setTimeout(resolve, minPollingRate - timeSinceSync));

    eventProcessor.state.lastUpdate = Date.now();

    //|console.log(eventProcessor.queue);
    eventProcessor.queue = [];

    eventProcessor.poll = true;

    eventProcessor.processPromise = null;

    return eventProcessor;
}