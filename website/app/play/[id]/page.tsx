"use client";

import { Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { Chat, ChatHandler } from "./handlers/Chat";
import Handler from "./handlers/Handler";

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();
    const minPollingRate = 1000 / 20;

    const [persistentEventProcessor, setPersistentEventProcessor] = useState({
        state: {
            id: -1,
            lastUpdate: Date.now()
        },
        messages: [
            {
                id: -1,
                time: new Date().toTimeString().slice(0, 5),
                type: "light_italic_yellow",
                content: "Joining room " + params.id
            }
        ] as any[],
        queue: [] as any[],
        sync: async () => { },
        process: async (event: any) => { },
        handlers: [ChatHandler] as any[],
        poll: true,
    } as any);

    const eventProcessor = {
        state: {
            id: -1,
            lastUpdate: Date.now()
        },

        messages: [] as any[],

        queue: [],
        handledHashes: {},
        handlers: [],

        processPromise: null as any,

        poll: true,

        sync: async () => {
            for (const key of Object.keys(persistentEventProcessor)) {
                if (typeof eventProcessor[key as keyof typeof eventProcessor] == "function") continue;
                eventProcessor[key as keyof typeof eventProcessor] = persistentEventProcessor[key];
            }


            if (!eventProcessor.processPromise) {
                eventProcessor.processPromise = Handler(eventProcessor, router, params, minPollingRate);
                eventProcessor.queue = [];
            } else {                
                const newEventProcessor = await eventProcessor.processPromise;

                for (const key of Object.keys(newEventProcessor)) {
                    if (typeof eventProcessor[key as keyof typeof eventProcessor] == "function" || key == "queue") continue;
                    eventProcessor[key as keyof typeof eventProcessor] = newEventProcessor[key];
                }
            }

            setPersistentEventProcessor(eventProcessor)
        },
        process: (event: any, eventProcessor: any) => {
            if (eventProcessor.handledHashes[event.hash]) {
                console.log("Dupe event, skipping");
                return;
            }

            eventProcessor.handledHashes[event.hash] = event.id;

            // Dont eat up memory
            for (const key of Object.keys(persistentEventProcessor)) {
                const eventId = persistentEventProcessor[key];
                if (eventProcessor - eventId > 100) delete persistentEventProcessor[key];
            }

            for (const handler of eventProcessor.handlers) {
                handler(event, eventProcessor);
            }
        }
    }

    useEffect(() => { eventProcessor.sync() }, [persistentEventProcessor]);

    return (
        <section className="absolute left-0 flex flex-row items-center justify-center h-full w-full gap-5 p-6">
            <div className="flex flex-row rounded-2xl bg-black/20 border border-secondary h-full w-full p-6 justify-between">
                <div className="flex flex-col justify-between whitespace-nowrap">
                    <div className="">
                        <h1 className="absolute text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-secondary to-accent ">Flappy Bird</h1>
                    </div>
                    <Button color="secondary" className="font-bold text-xl w-36">Leave</Button>
                </div>
                <div className="w-full flex items-center justify-center">
                    <h1 className="text-5xl font-bold text-white/50">Waiting for host to start</h1>
                </div>
                <h1 className="text-5xl font-bold text-white/50">{params.id}</h1>
            </div>
            <div className="rounded-2xl bg-black/20 border border-secondary p-4 flex flex-col gap-3 h-full w-96">
                <Chat setPersistentEventProcessor={setPersistentEventProcessor} persistentEventProcessor={persistentEventProcessor} />
            </div>
        </section >
    );
}
