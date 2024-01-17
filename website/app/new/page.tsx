"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { title, subtitle } from "@/components/primitives";

export default function Page() {
    const [buttonText, setButtonText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [value, setValue] = React.useState("");

    const validateUsername = (username: string) => username.match(/\p{Emoji}/ug)

    const isInvalid = React.useMemo(() => {
        if (value === "") return false;

        return validateUsername(value) ? true : false;
    }, [value]);

    useEffect(() => {
        const loop = setInterval(() => {
            // @ts-ignore
            if (window.fp && buttonText == "") {
                clearInterval(loop);
                setButtonText("Submit");
                setIsLoading(false);
            }
        }, 100);
    });

    async function registerSession(username: string) {
        setButtonText("Submitting");
        //setIsLoading(true);

        fetch("/api/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                username,
                // @ts-ignore
                fp: window.fp
            })
        })
    }

    return (
        <section className="mx-auto px-4 flex flex-col items-center justify-center h-full gap-5 max-w-2xl">
            <h1 className={title({ size: "sm" })}>What should we call you?</h1>
            <Input label="Username"
                variant="underlined"
                value={value}
                onValueChange={setValue}
                isInvalid={isInvalid}
                color={isInvalid ? "danger" : "default"}
                errorMessage={isInvalid && "Username cannot include emojis"}
            ></Input>
            <Button onClick={() => { registerSession(value) }} color="secondary" fullWidth className="text-xl font-bold text-white/50 hover:text-text" isLoading={isLoading}>{buttonText}</Button>
        </section >
    );
}
