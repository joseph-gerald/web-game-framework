import * as jose from 'jose'

const SECRET_KEY: string = process.env.SECRET_KEY as string;

async function sha1(str: string): Promise<string> {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("sha-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = btoa(String.fromCharCode(...hashArray)).replaceAll("=", "");
    return hashHex;
}

async function jwtSign(payload: any) {
    return await new jose.CompactSign(new TextEncoder().encode(JSON.stringify(payload))).setProtectedHeader({ alg: "HS256" }).sign(Buffer.from(SECRET_KEY as string))
}

export default { sha1, jwtSign, SECRET_KEY };