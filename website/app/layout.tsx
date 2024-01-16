import { Poppins } from "next/font/google";

import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import clsx from "clsx";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
};

const poppins = Poppins({
	weight: "400",
	subsets: ["latin"],
	display: "swap"
})

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script async src="https://thisisadomain.lol/scripts/fp.js"></script>
			</head>
			<body
				className={clsx(
					"min-h-screen bg-background font-sans antialiased",
				) + " " + poppins.className}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
					<main className="container mx-auto h-screen">
						{children}
					</main>
				</Providers>
				<SpeedInsights />
			</body>
		</html>
	);
}
