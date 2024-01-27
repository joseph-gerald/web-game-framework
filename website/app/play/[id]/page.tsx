"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { Chat, ChatHandler } from "./handlers/impl/system/Chat";
import Handler from "./handlers/Handler";
import { GameSelectionHandler, GameSelector } from "./handlers/impl/system/GameSelector";
import { BoxDemo, BoxDemoHandler } from "./handlers/impl/games/BoxGame";

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();
    const minPollingRate = 1000 / 1;

    const [persistentEventProcessor, setPersistentEventProcessor] = useState({
        state: {
            id: -1,
            lastUpdate: Date.now(),
            players: [] as any[],
            screen: "idle"
        },
        config: {
            showTitle: true,
            showPlayerList: true,

            showRoomCode: true,

            showChat: true
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
        handlers: [ChatHandler, GameSelectionHandler, BoxDemoHandler],
        screens: {},

        games: [
            {label: "Box Demo", value: "box_demo",},
        ],
        getScreen: () => { return <></> },

        isHost: false,
    } as any);

    const eventProcessor = {
        state: { screen: "idle" },

        config: {},

        messages: [] as any[],

        queue: [],
        handledHashes: {},
        handlers: [],
        screens: {
            "idle": <GameSelector setPersistentEventProcessor={setPersistentEventProcessor} persistentEventProcessor={persistentEventProcessor} />,
            "box_demo": <BoxDemo setPersistentEventProcessor={setPersistentEventProcessor} persistentEventProcessor={persistentEventProcessor} />,
        },

        processPromise: null as any,

        poll: true,

        sync: async () => {
            for (const key of Object.keys(persistentEventProcessor)) {
                if (typeof eventProcessor[key as keyof typeof eventProcessor] == "function" || key == "screens") continue;
                eventProcessor[key as keyof typeof eventProcessor] = persistentEventProcessor[key];
            }

            if (!eventProcessor.processPromise) {
                if (eventProcessor.queue.length > 0) {
                    Handler(eventProcessor, router, params, minPollingRate);
                    return console.log("EVENT PUSHED")
                }
                eventProcessor.processPromise = Handler(eventProcessor, router, params, minPollingRate);
                eventProcessor.queue = [];
            } else {
                const newEventProcessor = await eventProcessor.processPromise;

                for (const key of Object.keys(newEventProcessor)) {
                    if (typeof eventProcessor[key as keyof typeof eventProcessor] == "function" || key == "queue" || key == "screens") continue;
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
        },

        getScreen: () => {
            return (eventProcessor.screens as any)[eventProcessor.state.screen as any];
        },

        appendQueue: (event: any) => {
            setPersistentEventProcessor({
                ...persistentEventProcessor,
                queue: [...persistentEventProcessor.queue, event]
            })
        }
    }

    useEffect(() => { eventProcessor.sync() }, [persistentEventProcessor]);

    return (
        <section className="absolute left-0 flex flex-row items-center justify-center h-full w-full gap-5 p-6">
            <div className="flex flex-row rounded-2xl bg-black/20 border border-secondary h-full w-full p-6 justify-between">
                {
                    (persistentEventProcessor.config.showTitle || persistentEventProcessor.config.showPlayerList) ? (
                        <div className="flex flex-col justify-between whitespace-nowrap">
                            <div className="absolute">
                                {
                                    persistentEventProcessor.config.showTitle ? (
                                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-secondary to-accent ">Flappy Bird</h1>
                                    ) : <></>
                                }

                                {
                                    persistentEventProcessor.config.showPlayerList ? (
                                        <div>
                                            <b className="text-xl">Players</b>
                                            {persistentEventProcessor.state.players.map((player: any) => {
                                                return <div key={player.session_id + player.username}>{player.username}</div>
                                            })}
                                        </div>
                                    ) : <></>
                                }
                            </div>
                        </div>
                    ) : <></>
                }
                {persistentEventProcessor.getScreen()}
                {

                    persistentEventProcessor.config.showRoomCode ? (
                        <div>
                            <h1 className="absolute -translate-x-full text-5xl font-bold text-white/50">{params.id}</h1>
                        </div>
                    ) : <></>
                }
            </div>
            {
                persistentEventProcessor.config.showChat ? (
                    <div className="rounded-2xl bg-black/20 border border-secondary p-4 flex flex-col gap-3 h-full w-96">
                        <Chat setPersistentEventProcessor={setPersistentEventProcessor} persistentEventProcessor={persistentEventProcessor} />
                    </div>
                ) : <></>
            }
        </section >
    );
}
