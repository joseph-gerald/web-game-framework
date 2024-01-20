"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { title } from "@/components/primitives";
import {
    Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue,
    Input, Slider, Skeleton, Select, SelectItem
} from "@nextui-org/react";

const columns = [
    {
        key: "name",
        label: "NAME",
    },
    {
        key: "description",
        label: "DESCRIPTION",
    },
    {
        key: "ping",
        label: "PING",
    },
];

export default function Page({ params }: { params: { id: string, count: string } }) {
    const { id, count } = params;

    const router = useRouter()
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

    async function fetchData() {
        if (startedFetch) return;

        startedFetch = true;

        const res = await fetch("/api/servers", { method: "POST" });
        const data = await res.json();

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

    return (
        <section className="px-4 flex flex-col items-center w-full h-full gap-5">
            <h1 className={"mt-[90px] " + title({ size: "lg" })}>Create Room</h1>
            <div className="flex w-full gap-10 mt-10">
                <div className="w-full">
                    <Table removeWrapper
                        className={groupClassnames}
                        classNames={tableClassNames}
                        fullWidth={true}
                        aria-label="Selection behavior table example with dynamic content"
                        selectionMode="single"
                        selectionBehavior="replace"
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
                        <Input radius="sm" isClearable classNames={inputClassNames} labelPlacement="outside" label="Room Name" placeholder={username + "'s Room"} />
                        <Slider
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
                        />
                        <Select
                            labelPlacement="outside"
                            label="Choose Node"
                            className="max-w-xs"
                        >
                            {data.map((server) => (
                                <SelectItem key={server.id} value={server.name}>
                                    {server.id + " / " + server.name + " / " + server.ping}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>
        </section >
    );
}
