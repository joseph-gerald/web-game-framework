"use client";

import React, { useEffect, useState } from "react";
import { Card, Button } from "@nextui-org/react";
import { Icon } from '@iconify/react';
import { title } from "@/components/primitives";
import { useRouter } from 'next/navigation'
import InputCode from "@/components/inputCode";
import { inconsolata } from "../fonts";

export default function Home() {
    const router = useRouter()
    const defaultState = {
        code: "NONE",
        name: "Example's Room",
        players: 7,
        maxPlayers: 20,
        status: "Playing - Flappy Bird",
        host: {
            name: "Player 2",
            session: "65ad62ef20121dfb0634fb6e"
        },
        ping: "-1ms",
        edgePing: "-1ms"
    };

    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [canJoin, setCanJoin] = useState(false);
    const [data, setData] = useState(defaultState);

    useEffect(() => {
        setUsername(window.localStorage.getItem("username") as string);
    }, []);

    const pingStyle = "bg-clip-text text-transparent bg-gradient-to-b from-secondary to-primary";

    const fetchRoom = async (code: string) => {
        setCanJoin(false)
        let res = await fetch("/api/room/preview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code
            })
        });

        const data = await res.json();

        if (res.status != 200) return setData({
            code,
            name: "Room not found",
            players: 0,
            maxPlayers: 0,
            status: "Room not found",
            host: {
                name: "No one",
                session: "65ad62ef20121dfb0634fb6e"
            },
            ping: "-1ms",
            edgePing: "-1ms"
        })

        let newData = {
            code,
            name: data.name,
            players: data.player_count,
            maxPlayers: data.max_players,
            status: data.status,
            host: data.host,
            ping: "...",
            edgePing: "..."
        }

        const pre = Date.now();
        res = await fetch("/api/servers/ping", { method: "POST", body: JSON.stringify({ id: data.node }) });
        const post = Date.now() - pre;

        const ping = await res.json();

        // Time taken for entire request - time taken for database ping
        const edgePing = post - ping.ping;
        
        newData.edgePing = edgePing + "ms"
        newData.ping = ping.ping + "ms"

        setData(newData)
        setCanJoin(true)
    }

    function inputChanged() {
        setCanJoin(false)

        setData(defaultState);
    }

    return (
        <section className="px-4 flex flex-col items-center w-full h-full gap-5">
            <h1 className={"mt-[90px] " + title({ size: "lg" })}>Create Room</h1>

            <div className="mx-auto flex gap-10 mt-10 flex-col h-full">
                <InputCode length={4} loading={false} onComplete={(code) => fetchRoom(code)} onChange={inputChanged} />

                <div className="lg:mx-5 lg:ml-6 mb-auto">
                    <Card shadow="none" className="bg-black/20 flex flex-col lg:flex-row p-4 gap-5 w-full lg:text-xl">
                        <div className="flex justify-between lg:flex-col lg:justify-center items-center w-full lg:w-fit">
                            <h3 className="font-semibold text-3xl text-nowrap">Room Preview</h3>
                            <h2 className={"font-semibold text-8xl mx-4 " + inconsolata.className}>{data.code}</h2>
                        </div>

                        <div className="flex bg-secondary/30 p-2 rounded-lg lg:rounded-l-none lg:border-l-1 w-full justify-between">
                            <div className="flex flex-col gap-5 mx-2">
                                <div className="">
                                    <h4 className="font-semibold">{data.name}</h4>
                                    <p>{data.players}/{data.maxPlayers} players</p>
                                    <p>{data.status}</p>
                                </div>

                                <div className="text-white/60">
                                    <p>client to edge <b className={pingStyle}>{data.edgePing}</b></p>
                                    <p>edge to eu-north-sw <b className={pingStyle}>{data.ping}</b></p>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <Button isDisabled={!canJoin} className="font-bold text-xl bg-primary/40 w-fit ml-auto">
                                    JOIN
                                </Button>

                                <span>
                                    Host - <b className="font-semibold">Player 2 😊</b>
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <h1 className={"font-thin text-xl lg:text-2xl text-default-600 absolute bottom-9 left-1/2 -translate-x-1/2 w-fit invisible sm:visible"}>Joining as {username}</h1>
        </section>
    );
}
