"use client";

import { Input, Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { Message, ChatMessage } from "./components/message";

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();
    const minPollingRate = 1000;

    const [roomState, setRoomState] = useState({
        id: -1,
        lastUpdate: Date.now()
    } as any);
    const [messages, setMessages] = useState([] as any[]);
    const [queue, setQueue] = useState([] as any[]);
    const [textValue, setTextValue] = useState('');
    const [persistentEventProcessor, setPersistentEventProcessor] = useState({} as any);

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            console.log(textValue);

            setPersistentEventProcessor({
                ...persistentEventProcessor,
                queue: [...persistentEventProcessor.queue, {
                    type: "chat",
                    data: {
                        content: textValue
                    }
                }]
            })

            setTextValue('');
        }
    };

    const eventProcessor = {
        state: {
            id: -1,
            lastUpdate: Date.now()
        },
        messages: [{
            id: -1,
            time: new Date().toTimeString().slice(0, 5),
            type: "light_italic_yellow",
            content: "Joining room " + params.id
        }] as any[],
        queue: [],
        sync: async () => {
            for (const key of Object.keys(persistentEventProcessor)) {
                eventProcessor[key as keyof typeof eventProcessor] = persistentEventProcessor[key];
            }

            const res = await fetch("/api/room/sync", {
                method: "POST",
                body: JSON.stringify({
                    state_id: roomState.id,
                    queue: queue
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
                eventProcessor.process(event);
            }

            const timeSinceSync = Date.now() - roomState.lastUpdate;

            if (timeSinceSync < minPollingRate) await new Promise((resolve) => setTimeout(resolve, minPollingRate - timeSinceSync));

            eventProcessor.state.lastUpdate = Date.now();

            setMessages(eventProcessor.messages);
            setRoomState(eventProcessor.state);
            setQueue(eventProcessor.queue);

            setPersistentEventProcessor(eventProcessor)

            console.log(eventProcessor.state);
        },
        process: async (event: any) => {
            switch (event.type) {
                case "message":
                    const timestamp = new Date().toTimeString().slice(0, 5);

                    eventProcessor.messages.push({
                        id: event.id,
                        time: timestamp,
                        ...event.data
                    });
                    break;
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
                <div className="bg-black/20 p-4 py-2 rounded-2xl h-full" suppressHydrationWarning>
                    {
                        messages.length == 0 ?
                            (<Message time={new Date().toTimeString().slice(0, 5)} type="light_italic_yellow" content={"Joining room " + params.id} />)
                            :
                            messages.map((message: any) => {
                                return message.chat ? (
                                    <ChatMessage key={message.id} time={message.time} sender={message.sender} content={message.content} />
                                ) : (
                                    <Message key={message.id} time={message.time} type={message.type} content={message.content} />
                                );
                            })
                    }
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
                    }}
                        value={textValue}
                        onValueChange={setTextValue}
                        onKeyDown={handleKeyDown}
                        placeholder="Send /help to see commands"></Input>
                </div>
            </div>
        </section >
    );
}
