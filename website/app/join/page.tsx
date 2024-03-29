"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, Skeleton } from "@nextui-org/react";
import { title } from "@/components/primitives";
import { useRouter } from 'next/navigation'
import InputCode from "@/components/inputCode";
import { inconsolata } from "../fonts";
import { set } from "mongoose";

export default function Home() {
    const router = useRouter()
    const defaultState = {
        code: "NONE",
        name: "Not A Room",
        players: -1,
        maxPlayers: 0,
        status: "Playing - Nothing",
        host: {
            username: "No One 🤖",
            session: "65ad62ef20121dfb0634fb6e"
        },
        node: {
            id: "-1",
            name: "nothing"
        },
        ping: "-1ms",
        edgePing: "-1ms"
    };

    const [username, setUsername] = useState("");
    const [canJoin, setCanJoin] = useState(false);
    const [isLoaded, setIsLoaded] = useState(true);
    const [data, setData] = useState(defaultState);

    useEffect(() => {
        setUsername(window.localStorage.getItem("username") as string);
    }, []);

    const pingStyle = "bg-clip-text text-transparent bg-gradient-to-b from-secondary to-primary";

    async function join() {
        setIsLoaded(false)
        const res = await fetch("/api/room/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: data.code,
            })
        });

        const json = await res.json();

        console.log(json);

        setIsLoaded(true);

        if (res.status != 200) return;

        document.cookie = "key=" + json.key + "; path=/;";
        window.localStorage.setItem("key", json.key);

        router.push("/play/" + data.code);
    }

    const fetchRoom = async (code: string) => {
        setCanJoin(false)
        setIsLoaded(false)

        const prePreview = Date.now();

        let res = await fetch("/api/room/preview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code
            })
        });

        const previewPing = Date.now() - prePreview;

        const data = await res.json();

        if (res.status != 200) {
            setCanJoin(true)
            setIsLoaded(true)

            return setData({
                code,
                name: "Room not found",
                players: 0,
                maxPlayers: 0,
                status: "Room not found",
                host: {
                    username: "No one",
                    session: "65ad62ef20121dfb0634fb6e"
                },
                node: {
                    id: "-1",
                    name: "nothing"
                },
                ping: "-1ms",
                edgePing: "-1ms"
            });
        }

        let newData = {
            code,
            name: data.name,
            players: data.player_count,
            maxPlayers: data.max_players,
            status: data.status,
            host: data.host,
            ping: "...",
            edgePing: "...",
            node: data.node
        }

        const pre = Date.now();
        res = await fetch("/api/servers/ping", { method: "POST", body: JSON.stringify({ id: data.node.id }) });
        const post = Date.now() - pre;

        const ping = await res.json();

        // Time taken for entire request - time taken for database ping
        const edgePing = Math.min(post - ping.ping, previewPing);

        newData.edgePing = edgePing + "ms"
        newData.ping = ping.ping + "ms"

        setData(newData)
        setCanJoin(true)
        setIsLoaded(true)
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

                        <Skeleton isLoaded={isLoaded} className="w-full rounded-lg lg:rounded-l-none">
                            <div className="flex bg-secondary/30 p-2 rounded-lg lg:rounded-l-none lg:border-l-1 w-full justify-between">
                                <div className="flex flex-col gap-5 mx-2">
                                    <div className="">
                                        <h4 className="font-semibold">{data.name}</h4>
                                        <p>{data.players}/{data.maxPlayers} players</p>
                                        <p>{data.status}</p>
                                    </div>

                                    <div className="text-white/60">
                                        <p>client to edge <b className={pingStyle}>{data.edgePing}</b></p>
                                        <p>edge to {data.node.name} <b className={pingStyle}>{data.ping}</b></p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between">
                                    <Button onClick={join} isDisabled={!canJoin || !isLoaded} className="font-bold text-xl bg-primary/40 w-fit ml-auto">
                                        JOIN
                                    </Button>

                                    <span>
                                        Host - <b className="font-semibold">{data.host.username}</b>
                                    </span>
                                </div>
                            </div>
                        </Skeleton>
                    </Card>
                </div>
            </div>

            <h1 className={"font-light text-xl lg:text-2xl text-default-600 absolute bottom-9 left-1/2 -translate-x-1/2 w-fit invisible sm:visible"}>Joining as {username}</h1>
        </section>
    );
}
