"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();
    const minPollingRate = 1000;

    const [roomState, setRoomState] = useState({} as any);

    const eventProcessor = {
        state: {
            id: -1,
            lastUpdate: Date.now()
        },
        queue: [],
        sync: async () => {
            const res = await fetch("/api/room/sync", {
                method: "POST",
                body: JSON.stringify({
                    state_id: eventProcessor.state.id,
                    queue: eventProcessor.queue
                })
            })
            const data = await res.json();


            if (res.status != 200) return router.push("/");

            eventProcessor.state.id = data.state_id;

            for (const event of data.events) {
                eventProcessor.process(event);
            }

            const timeSinceSync = Date.now() - eventProcessor.state.lastUpdate;

            if (timeSinceSync < minPollingRate) await new Promise((resolve) => setTimeout(resolve, minPollingRate - timeSinceSync));

            setRoomState(eventProcessor.state);
            eventProcessor.state.lastUpdate = Date.now();

            console.log(eventProcessor.state);
        },
        process: async (event: any) => {

        }
    }

    useEffect(() => { eventProcessor.sync() }, [roomState]);

    return (
        <section className="mx-auto px-4 flex flex-col items-center justify-center h-full gap-5 max-w-2xl">
            {JSON.stringify(roomState)}
        </section >
    );
}
