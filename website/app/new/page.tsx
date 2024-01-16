"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { title, subtitle } from "@/components/primitives";

export default function Page() {
    const [buttonText, setButtonText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loop = setInterval(() => {
            // @ts-ignore
            if (window.fp) {
                clearInterval(loop);
                setButtonText("Submit");
                setIsLoading(false);
            }
        }, 100);
    });

    return (
        <section className="mx-auto px-4 flex flex-col items-center justify-center h-full gap-5 max-w-2xl">
            <h1 className={title({ size: "sm" })}>What should we call you?</h1>
            <Input label="Username" variant="underlined"></Input>
            <Button color="secondary" fullWidth className="text-xl font-bold text-white/50 hover:text-text" isLoading={isLoading}>{buttonText}</Button>
        </section>
    );
}
