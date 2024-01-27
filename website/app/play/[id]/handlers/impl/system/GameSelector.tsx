import {
    Button, Autocomplete,
    AutocompleteSection,
    AutocompleteItem
} from "@nextui-org/react";
import { useState } from "react";

interface Props {
    setPersistentEventProcessor: (_: any) => void;
    persistentEventProcessor: any;
}

export const GameSelector: React.FC<Props> = ({ setPersistentEventProcessor, persistentEventProcessor }) => {
    const [value, setValue] = useState<React.Key>("none");

    function start() {
        persistentEventProcessor.appendQueue({
            target: "room.start",
            game: value,
        })
    }

    return (
        <>
            <div className="w-full flex flex-col gap-5 items-center justify-center">
                {
                    persistentEventProcessor.isHost ? (
                        <>
                            <h1 className="text-5xl font-bold text-white/50">Waiting for host to start</h1>
                            <div className="flex gap-2">
                                <Autocomplete
                                    size="sm"
                                    label="Select a gamemode"
                                    className="max-w-xs"
                                    onSelectionChange={setValue}
                                >
                                    {persistentEventProcessor.games.map((game: any) => (
                                        <AutocompleteItem key={game.value} value={game.value}>
                                            {game.label}
                                        </AutocompleteItem>
                                    ))}
                                </Autocomplete>
                                <Button isDisabled={value == "none"} onClick={start} radius="sm" size="lg">Start Room</Button>
                            </div>
                        </>
                    ) : (
                        <h1 className="text-5xl font-bold text-white/50">Waiting for host to start</h1>
                    )
                }
            </div>
        </>
    )
}

export const GameSelectionHandler = (event: any, eventProcessor: any) => {
    const timestamp = new Date().toTimeString().slice(0, 5);

    switch (event.type) {
        case "room.screen":
            eventProcessor.state.screen = event.data.screen;
            break;
    }
}