import * as jose from 'jose'
import sha1 from 'sha1'

const SECRET_KEY: string = process.env.SECRET_KEY as string;

async function jwtSign(payload: any) {
    return await new jose.CompactSign(new TextEncoder().encode(JSON.stringify(payload))).setProtectedHeader({ alg: "HS256" }).sign(Buffer.from(SECRET_KEY as string))
}

export default { sha1, jwtSign, SECRET_KEY };