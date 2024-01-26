import { Input } from "@nextui-org/react";
import { ChatMessage, Message } from "../../../components/message";
import { useState } from "react";

interface InputCodeProps {
    setPersistentEventProcessor: (_: any) => void;
    persistentEventProcessor: any;
}

export const Chat: React.FC<InputCodeProps> = ({ setPersistentEventProcessor, persistentEventProcessor }) => {
    const [textValue, setTextValue] = useState('');

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter' && textValue != "") {
            setPersistentEventProcessor({
                ...persistentEventProcessor,
                queue: [...persistentEventProcessor.queue, {
                    target: "chat",
                    data: {
                        message: textValue
                    }
                }]
            })

            setTextValue('');
        }
    };

    return (
        <>
            <div className="bg-black/20 p-4 py-2 rounded-2xl h-full overflow-y-scroll" suppressHydrationWarning>
                {
                    persistentEventProcessor.messages.map((message: any) => {
                        return message.chat ? (
                            <ChatMessage key={message.id} time={message.time} sender={message.sender} content={message.content} />
                        ) : (
                            <Message key={message.id} time={message.time} type={message.type} content={message.content} />
                        );
                    })
                }
            </div>
            <div>
                <Input classNames={{
                    input: [
                        "bg-transparent",
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                    ],
                    innerWrapper: "bg-transparent",
                    inputWrapper: [
                        "shadow-xl",
                        "!bg-black/20",
                        "!cursor-text",
                    ],
                }}
                    value={textValue}
                    onValueChange={setTextValue}
                    onKeyDown={handleKeyDown}
                    placeholder="Send /help to see commands"></Input>
            </div>
        </>
    )
}

export const ChatHandler = (event: any, eventProcessor: any) => {
    const timestamp = new Date().toTimeString().slice(0, 5);

    switch (event.type) {
        case "message":
            eventProcessor.messages.push({
                id: event.id,
                time: timestamp,
                ...event.data
            });
            break;
        case "chat":
            console.info("CHAT EVENT", event);
            eventProcessor.messages.push({
                chat: true,
                id: event.hash,
                time: timestamp,
                content: event.data.message,
                sender: event.data.sender
            });
            break;
        case "connect":
            eventProcessor.messages.push({
                id: event.id,
                time: new Date().toTimeString().slice(0, 5),
                type: "bold_gray",
                content: event.data.username + " just connected",
            });
            break;
        case "join":
            // Join event is when you join the room from the join page and not when you connect to the room
            break;
        default:
            console.warn("Unknown event type: " + event.type);
            console.info(event);
    }
}