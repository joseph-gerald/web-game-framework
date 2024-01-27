import { inconsolata } from "@/app/fonts";

interface Props {
    time: string;
    type: string;
    content: string;
}

interface ChatProps {
    time: string;
    sender: string;
    content: string;
}

const styles: { [key: string]: string } = {
    "light_italic_yellow": "italic font-light text-[#7A8345]",
    "medium_italic_green": "italic font-medium text-[#2E7A48]",
    "bold_gray": "font-semibold text-white/60",
}

function Message(props: Props) {
    return (
        <div className="flex flex-row">
            <small suppressHydrationWarning className={"mt-auto mr-1 opacity-50 " + inconsolata.className}>{props.time}</small><p className={styles[props.type]}>{props.content}</p>
        </div>
    )
}

function ChatMessage(props: ChatProps) {
    return (
        <div className="flex flex-row">
            <small suppressHydrationWarning className={"mt-auto mr-1 opacity-50 " + inconsolata.className}>{props.time}</small><p className="font-medium">{props.sender}</p><p className="mx-2 opacity-60">{">"}</p><p className="">{props.content}</p>
        </div>
    )
}

export {
    Message,
    ChatMessage
}