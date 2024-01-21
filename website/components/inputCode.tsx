import React, { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { inconsolata } from "@/app/fonts";

interface InputCodeProps {
    length: number;
    loading: boolean;
    onComplete: (code: string) => void,
    onChange: () => void
}

// Based on
// https://codesandbox.io/p/sandbox/verification-code-input-zjxvo?file=%2Fsrc%2FInputCode.js%3A27%2C24-28%2C40

const InputCode: React.FC<InputCodeProps> = ({ length, loading, onComplete, onChange }) => {
    const [code, setCode] = useState([...Array(length)].map(() => ""));
    const inputs = useRef<(HTMLInputElement | null)[]>([]); // Add type annotation here

    const processInput = (e: ChangeEvent<HTMLInputElement>, slot: number) => { // Add type annotations here
        const char = e.target.value.toUpperCase();
        if (/[^a-zA-Z0-9]/.test(char)) return;
        const newCode = [...code];
        newCode[slot] = char;
        setCode(newCode);
        if (slot !== length - 1) {
            inputs.current[slot + 1]?.focus();
        }
        if (newCode.every(char => char != "")) {
            onComplete(newCode.join(""));
            inputs.current[slot]?.blur();
        }

        onChange();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, slot: number) => {
        onChange();

        if (e.code == "ArrowLeft" || e.code == "ArrowRight") {
            e.preventDefault();
            const input = inputs.current[slot + (e.code == "ArrowLeft" ? -1 : 1)];
            input?.focus();
            input?.setSelectionRange(1, 1)
            return;
        }

        if (e.code == "Backspace") {
            e.preventDefault();
            const newCode = [...code];
            newCode[slot] = "";
            setCode(newCode);
        }

        if ((e.keyCode == 8) && !code[slot] && slot != 0 && inputs.current[slot]?.value == "") {
            const newCode = [...code];
            newCode[slot - 1] = "";
            setCode(newCode);
            inputs.current[slot - 1]?.focus();
        }

        if ((e.keyCode == 46) && slot != 3) {
            if (inputs.current[slot]?.value != "") {
                const newCode = [...code];
                newCode[slot] = "";
                setCode(newCode);
                return;
            } 
            const newCode = [...code];
            newCode[slot + 1] = "";
            setCode(newCode);
            inputs.current[slot + 1]?.focus();
        }

        if (!(/[^a-zA-Z0-9]/.test(String.fromCharCode(e.keyCode))) && code[slot] != "") {
            const newCode = [...code];
            newCode[slot] = String.fromCharCode(e.keyCode);
            setCode(newCode);
        }
    }

    return (
        <div className="flex flex-col items-start my-auto">
            <div className="code-inputs flex justify-start items-center">
                {code.map((num, idx) => {
                    return (
                        <input
                            className={inconsolata.className + " outline-none font-bold text-center text-8xl lg:text-[1000%] mx-3 lg:mx-6 rounded-3xl bg-black/20 w-1/2 h-fit py-5 lg:py-0 lg:w-48 lg:h-72"}
                            key={idx}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={num}
                            autoFocus={!code[0].length && idx === 0}
                            readOnly={loading}
                            onChange={e => processInput(e, idx)}
                            onKeyDown={e => onKeyDown(e, idx)}
                            ref={ref => inputs.current.push(ref)}
                        />
                    );
                })}
            </div>
        </div>
    )
}

export default InputCode;
