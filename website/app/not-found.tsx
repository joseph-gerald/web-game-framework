import { Link } from "@nextui-org/react";

export default function NotFound() {
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <h2 className="text-5xl font-semibold">Not Found</h2>
            <hr className="my-2" />
            <Link color="foreground" href="/" showAnchorIcon>Return Home</Link>
        </div>
    );
}