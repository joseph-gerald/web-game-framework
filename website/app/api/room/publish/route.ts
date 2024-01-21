import tracking_utils from "@/utils/tracking_utils";
import { client } from '@/app/api/_db';
import Room from "@/models/Room";
import { NextRequest } from "next/server";
import game_utils from "@/utils/game_utils";

client.db("wgf-demo").collection("rooms");

export async function POST(req: NextRequest) {
    let token = req.cookies.get('token')?.value;
    let key = req.cookies.get('key')?.value;
    
    if (!token || !key) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })

    const data = {
        token: await tracking_utils.readJWT(token),
        key: await tracking_utils.readJWT(key)
    }

    if (!data.token || !data.key) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })

    const { name, max_players, node } = await req.json();

    const room = await Room.findById(data.key.room.id);

    room.name = name;
    room.max_players = max_players;
    room.node_uri = game_utils.servers[parseInt(node.replace("GS_",""))].uri;

    room.status = "instantiated";

    console.log(data.key.room.id)

    console.log(room)

    return new Response(JSON.stringify({
        3:2
    }))
}