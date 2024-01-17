import { Secret } from "jsonwebtoken";

const SECRET_KEY: Secret = process.env.SECRET_KEY as string;

async function sha1(str: string): Promise<string> {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("sha-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = btoa(String.fromCharCode(...hashArray)).replaceAll("=", "");
    return hashHex;
}

export default { sha1, SECRET_KEY };