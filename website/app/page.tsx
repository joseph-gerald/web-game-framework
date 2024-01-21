"use client";

import React, { useEffect, useState } from "react";
import { Card, Spinner } from "@nextui-org/react";
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation'

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
		<section className="flex flex-col lg:flex-row items-center justify-around h-full">
			{[{
				name: "create",
				icon: "fluent:table-add-20-regular"
			},
			{
				name: "join",
				icon: "material-symbols:fiber-pin-rounded"
			}].map((item, index) => (
				<Card shadow="sm" className={`w-[calc(100%-50px)] my-6 mb-${item.name == "create" ? "0" : "24"} lg:my-0 lg:w-[45%] flex justify-center items-center p-8 border border-secondary bg-black/20`} key={index} isPressable={!isLoading} isDisabled={isLoading} onPress={isLoading ? void 0 : handlers[item.name]}>
					<b className={"absolute font-semibold text-5xl capitalize " + (isLoading ? "hidden" : "")}>{item.name} Room</b>
					<Icon className="w-full h-fit blur-md opacity-20" icon={item.icon} color="white" />
					<Spinner size="lg" color="secondary" className={`absolute ${isLoading ? "block" : "hidden"}`} />
				</Card>
			))}
			<h1 className={"font-normal text-xl lg:text-2xl text-default-600 absolute bottom-9 left-1/2 -translate-x-1/2 w-fit"}>{username}</h1>
		</section>
	);
}
