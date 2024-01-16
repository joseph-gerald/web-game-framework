import React from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { title, subtitle } from "@/components/primitives";

export default function Home() {
	return (
		<section className="mx-auto px-4 flex flex-col items-center justify-center h-full gap-5 max-w-2xl">
			<h1 className={title({
				size: "sm"
			})}>What should we call you?</h1>
			<Input label="Username" variant="underlined"></Input>
			<Button color="secondary" fullWidth spinner className="text-xl font-bold text-white/50">Submit</Button>
		</section>
	);
}
