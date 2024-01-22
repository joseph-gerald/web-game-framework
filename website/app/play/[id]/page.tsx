"use client";

import { Input, Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { Message, ChatMessage } from "./components/message";

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
                <h1 className="text-5xl font-bold text-white/50">3DWR</h1>
            </div>
            <div className="rounded-2xl bg-black/20 border border-secondary p-4 flex flex-col gap-3 h-full w-96">
                <div className="bg-black/20 p-4 py-2 rounded-2xl h-full">
                    <Message time="21:54" type="light_italic_yellow" content="Joining room 3DWR" />
                    <Message time="21:54" type="medium_italic_green" content="Joined 3DWR" />
                    <Message time="21:56" type="bold_gray" content="Player3 has joined" />
                    <ChatMessage time="21:57" sender="Player3" content="Hello everyone" />
                </div>
                <div>
                    <Input classNames={{
                        input: [
                            "bg-transparent",
                            "text-black/90 dark:text-white/90",
                            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                        ],
                        innerWrapper: "bg-transparent",
                        inputWrapper: [
                            "shadow-xl",
                            "!bg-black/20",
                            "!cursor-text",
                        ],
                    }} placeholder="Send /help to see commands"></Input>
                </div>
            </div>
        </section >
    );
}
