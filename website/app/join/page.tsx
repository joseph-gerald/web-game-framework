"use client";

import React, { useEffect, useState } from "react";
import { Card, Spinner } from "@nextui-org/react";
import { Icon } from '@iconify/react';
import { title } from "@/components/primitives";
import { useRouter } from 'next/navigation'
import InputCode from "@/components/inputCode";

export default function Home() {
	const router = useRouter()

	const [username, setUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setUsername(window.localStorage.getItem("username") as string);
	}, []);

	const handlers: { [key: string]: () => void } = {
		create: async () => {
			setIsLoading(true)
			const data = await fetch("/api/room/reserve", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				}
			}).then(res => res.json());

			document.cookie = "key=" + data.key + "; path=/;";
			window.localStorage.setItem("key", data.key);

			router.push("/setup/" + data.count + "/" + data.code);
		},
		join: async () => {
			console.log("join");
		}
	}

	return (
        <section className="px-4 flex flex-col items-center w-full h-full gap-5">
            <h1 className={"mt-[90px] " + title({ size: "lg" })}>Create Room</h1>
            
            <div className="flex w-full gap-10 mt-10 flex-col lg:flex-row">
                 <InputCode length={4} loading={false} onComplete={() => 0} />
            </div>

			<h1 className={"font-normal text-xl lg:text-2xl text-default-600 absolute bottom-9 left-1/2 -translate-x-1/2 w-fit"}>{username}</h1>
		</section>
	);
}
