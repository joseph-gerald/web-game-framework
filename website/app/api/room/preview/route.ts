import tracking_utils from "@/utils/tracking_utils";
import { client } from '@/app/api/_db';
import room_model from "@/models/Room";

client.db("wgf-demo").collection("rooms");

export async function POST(req: Request) {
    if (tracking_utils.isNotJSON(req)) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
    }
    
    const { code } = await req.json();

    const room = await room_model.Model.findOne({ code });

    if (!room) return new Response(JSON.stringify({ error: "Found No Room With Code" }), { status: 404 });

    if (room.status == "uninstantiated") return new Response(JSON.stringify({ error: "Room not published" }), { status: 400 });

    return new Response(JSON.stringify({ 
        name: room.name,
        max_players: room.max_players,
        player_count: room.players.length,
        node: room.node_id,
        status: room.status,
        host: room.players[0]
     }))
}