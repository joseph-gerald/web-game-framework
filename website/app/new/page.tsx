"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { title } from "@/components/primitives";
import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter()

    const [buttonText, setButtonText] = useState("");
    const [usernameError, setUsernameError] = React.useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [variant, setVariant] = useState("solid");

    const [value, setValue] = React.useState("");
    const [invalid, setInvalid] = React.useState(false);

    const emojiTest = (username: string) => username.match(/\p{Emoji}/ug)

    const isInvalid = () => {
        setInvalid(true);

        if (emojiTest(value)) {
            setUsernameError("Username cannot contain emojis");
            return true;
        }

        if (value.length < 3) {
            console.log(value)
            setUsernameError("Username must be at least 3 characters long");
            return true;
        }

        if (value.length > 20) {
            setUsernameError("Username cannot be longer than 20 characters");
            return true;
        }

        if (value.match(/[^a-zA-Z0-9_]/g)) {
            setUsernameError("Username can only contain letters, numbers and underscores");
            return true;
        }

        setUsernameError("");
        setInvalid(false);
        return false
    };

    useEffect(() => {
        (async () => {    
            const loop = setInterval(() => {
                // @ts-ignore
                if (window.fp && buttonText == "") {
                    clearInterval(loop);
                    setButtonText("Submit");
                    setIsLoading(false);
                }
            }, 100);
            
            try {
                await fetch("https://thisisadomain.lol/scripts/fp.js", { mode: "no-cors" })
            } catch (_) {
                setButtonText("ERROR");
                setIsLoading(false);
                setInvalid(true);
                setUsernameError("Failed to load fingerprinting script");
                setVariant("faded");
            }
        })();
    });

    async function registerSession(username: string) {
        if (isInvalid()) return;

        setButtonText("Submitting");
        setIsLoading(true);

        const res = await fetch("/api/create", {
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

        const data = await res.json();

        if (data.error) {
            setButtonText(data.error);
            setIsLoading(false);
            return console.error(data.error);
        }

        document.cookie = "token=" + data.token + "; path=/;";
        window.localStorage.setItem("username", data.username);
        window.localStorage.setItem("token", data.token);

        router.push("/");
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            registerSession(value);
        }
    }

    return (
        <section className="mx-auto px-4 flex flex-col items-center justify-center h-full gap-5 max-w-2xl">
            <h1 className={title({ size: "sm" })}>What should we call you?</h1>
            <Input label="Username"
                variant="underlined"
                value={value}
                onValueChange={setValue}
                isInvalid={invalid}
                color={invalid ? "default" : "default"}
                errorMessage={invalid && usernameError}
                onKeyDown={handleKeyDown}
            ></Input>
            <Button onClick={() => { registerSession(value) }} color="secondary" variant={variant as any} fullWidth className="text-xl font-bold text-white/50 hover:text-text" isLoading={isLoading}>{buttonText}</Button>
        </section >
    );
}
