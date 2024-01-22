import tracking_utils from "@/utils/tracking_utils";
import { client } from '@/app/api/_db';
import room_model from "@/models/Room";
import crypto_utils from "@/utils/crypto_utils";
import game_utils from "@/utils/game_utils";
import { NextRequest } from "next/server";

client.connect();
client.db("wgf-demo").collection("rooms");

export async function POST(req: NextRequest) {
    let token = req.cookies.get('token')?.value;
    
    if (!token) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })

    const data = await tracking_utils.readJWT(token);

    if (!data) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })

    const rooms = await client.db("wgf-demo").collection("rooms").find({}).toArray();
    const codes = rooms.map(x => x.code);

    let code = Math.random().toString(36).substring(2, 2 + 4).toUpperCase();
    const role = "host";
    const session = data.session_id;

    while (codes.includes(code)) {
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    const room = new room_model.Model({
        code,
        status: "uninstantiated",
        host: session,
        players: [{
            role,
            session,
            username: data.username,
            data: {}
        }],
    })

    await room.save();

    const key = await crypto_utils.jwtSign({
        room: {
            code,
            id: room._id
        },
        user: {
            role,
            session,
            username: data.username
        }
    });

    return new Response(JSON.stringify({
        count: game_utils.servers.length,
        code,
        key
    }))
}