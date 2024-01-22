import { Poppins } from "next/font/google";
import { Inconsolata } from "next/font/google";

export const poppins = Poppins({
	weight: ["100","200","300","400","500","600","700","800","900"],
	subsets: ["latin"],
	display: "swap"
})

export const inconsolata = Inconsolata({
    weight: ["300", "400","500","600","700","800","900"],
    subsets: ["latin"],
    display: "swap"
})