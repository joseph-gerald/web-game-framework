"use client";

import React, { useEffect, useState } from "react";
import { title } from "@/components/primitives";

export default function Home() {
	const [username, setUsername] = useState("");
	
	useEffect(() => {
		setUsername(window.localStorage.getItem("username") as string);
	}, []);

	return (
		<section className="mx-auto px-4 flex flex-col items-center justify-center h-full gap-5 max-w-2xl">
			<h1 className={title({ size: "sm" })}>Welcome {username}</h1>
		</section>
	);
}
