"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@nextui-org/react";
import { Icon } from '@iconify/react';

export default function Home() {
	const [username, setUsername] = useState("");

	useEffect(() => {
		setUsername(window.localStorage.getItem("username") as string);
	}, []);

	const handlers: { [key: string]: () => void } = {
		create: () => {
			console.log("create");
		},
		join: () => {
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
				<Card shadow="sm" className={`w-[calc(100%-50px)] my-6 mb-${item.name == "create" ? "0" : "24"} lg:my-0 lg:w-[45%] flex justify-center items-center p-8 border border-secondary bg-black/20`} key={index} isPressable onPress={handlers[item.name]}>
					<b className="absolute font-semibold text-5xl capitalize">{item.name} Room</b>
					<Icon className="w-full h-fit blur-md opacity-20" icon={item.icon} color="white" />
				</Card>
			))}
			<h1 className={"font-normal text-xl lg:text-2xl text-default-600 absolute bottom-9 left-1/2 -translate-x-1/2 w-fit"}>{username}</h1>
		</section>
	);
}
