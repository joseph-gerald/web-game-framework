"use client";

import { inconsolata } from "@/app/fonts";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { title } from "@/components/primitives";
import {
    Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue,
    Input, Slider, Skeleton, Select, SelectItem, Button
} from "@nextui-org/react";

const columns = [
    {
        key: "name",
        label: "NAME",
    },
    /*
    {
        key: "description",
        label: "DESCRIPTION",
    },*/
    {
        key: "id",
        label: "ID",
    },
    {
        key: "ping",
        label: "PING",
    },
];

export default function Page({ params }: { params: { id: string, count: string } }) {
    const { id, count } = params;

    const [maxPlayers, setMaxPlayers] = useState(9);

    const router = useRouter()
    const [node, setNode] = useState("GS_0")
    const [username, setUsername] = useState("");
    const groupClassnames = "flex flex-col p-8 border border-secondary bg-black/40 rounded-2xl w-full h-full"

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(
        Array.from({
            length: parseInt(count)
        }, () => (
            { name: "Loading...", description: "Loading...", id: "Loading...", ping: -1 }
        )).map((item, index) => ({ ...item, id: index }))
    );

    let startedFetch = false;

    function setNodeIfNew(key: Set<string>) {
        const next = key.entries().next();
        if (!next.value) return;
        const newValue = next.value[0];
        if (newValue != node) setNode(newValue);
    }

    async function fetchData() {
        if (startedFetch) return;

        startedFetch = true;

        const res = await fetch("/api/servers", { method: "POST" });
        const data = await res.json();

        if (res.status != 200) return router.push("/");

        setIsLoading(false);
        setData(data);
    }

    useEffect(() => {
        fetchData();
        setUsername(window.localStorage.getItem("username") as string);
    }, [])

    const tableClassNames = React.useMemo(
        () => ({
            th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
            td: [
                "group-data-[first=true]:first:before:rounded-none",
                "group-data-[first=true]:last:before:rounded-none",

                "group-data-[middle=true]:before:rounded-none",

                "group-data-[last=true]:first:before:rounded-none",
                "group-data-[last=true]:last:before:rounded-none",
            ],
        }),
        [],
    );

    const inputClassNames = React.useMemo(
        () => ({
            label: [
                "text-white/90",
                "font-semibold",
                "text-sm"
            ],
            inputWrapper: [
                "bg-white/5"
            ],
        }),
        [],
    );

    function publishRoom() {
        setIsLoading(true);
        fetch("/api/room/publish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.querySelector("input")?.value || username + "'s Room",
                max_players: maxPlayers,
                node: node
            })
        }).then(res => res.json()).then(data => {
            if (data.status == "success") {
                document.cookie = "key=" + data.key + "; path=/;";
                window.localStorage.setItem("key", data.key);

                router.push("/play/" + id);
            } else {
                router.push("/");
            }
        })
    }

    return (
        <section className="px-4 flex flex-col items-center w-full h-full gap-5">
            <h1 className={"mt-[90px] " + title({ size: "lg" })}>Create Room</h1>
            <div className="flex w-full gap-10 mt-10 flex-col lg:flex-row">
                <div className="w-full">
                    <Table removeWrapper
                        disabledKeys={isLoading ? data.map((server) => String(server.id)) : []}
                        className={groupClassnames}
                        classNames={tableClassNames}
                        fullWidth={true}
                        aria-label="Selection behavior table example with dynamic content"
                        selectionMode="single"
                        selectionBehavior="replace"
                        onRowAction={(key) => setNode(key as string)}
                    >
                        <TableHeader className="bg-red" columns={columns}>
                            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                        </TableHeader>
                        <TableBody
                            className={groupClassnames} items={data}>
                            {(item) => (
                                <TableRow key={item.id}>
                                    {(columnKey) => <TableCell>
                                        {(
                                            isLoading ?
                                                <>
                                                    <Skeleton className="rounded-sm">
                                                        <div className="h-5 rounded-sm bg-default-100"></div>
                                                    </Skeleton>
                                                </>
                                                :
                                                <>
                                                    {getKeyValue(item, columnKey)}
                                                </>
                                        )} </TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className={groupClassnames}>
                    <h2 className="font-semibold text-4xl">Room Creator</h2>
                    <br className="mt-8" />
                    <div className="flex flex-col gap-6">
                        <Input isDisabled={isLoading} radius="sm" isClearable classNames={inputClassNames} labelPlacement="outside" label="Room Name" placeholder={username + "'s Room"} />
                        <Slider
                            isDisabled={isLoading}
                            classNames={inputClassNames}
                            size="md"
                            step={4}
                            color="foreground"
                            label="Max Players"
                            showSteps={true}
                            maxValue={100}
                            minValue={2}
                            defaultValue={9}
                            className="max-w-md"
                            showOutline={true}
                            showTooltip
                            value={maxPlayers}
                            onChange={x => setMaxPlayers(x as number)}
                        />
                        <Select
                            isDisabled={isLoading}
                            selectedKeys={data.map((server) => String(server.id)).includes(String(node)) ? [node] : []}
                            onSelectionChange={(key) => setNodeIfNew(key as Set<string>)}
                            labelPlacement="outside"
                            label="Choose Node"
                            placeholder="Select a Node to host your room"
                            className="max-w-xs"
                        >
                            {data.map((server) => (
                                <SelectItem key={server.id} value={server.name}>
                                    {server.id + " / " + server.name + " / " + server.ping}
                                </SelectItem>
                            ))}
                        </Select>
                        <div className="flex flex-col bg-background rounded-2xl px-12 rounded-b-none mt-16">
                            <div className="flex flex-col justify-center items-center w-full p-6">
                                <b className="font-semibold capitalize text-2xl ">Reserved Code</b>
                                <b className={"font-semibold capitalize text-7xl text-[90px] " + inconsolata.className}>{id}</b>
                            </div>
                        </div>
                    </div>
                    <Button isLoading={isLoading} className="rounded-t-none" color="secondary" onClick={publishRoom}>Publish Room</Button>
                </div>
            </div>
            <br className="mt-8 w-1" />
        </section >
    );
}
