import tracking_utils from "@/utils/tracking_utils";
import { mongoose } from '@/app/api/_db';
import room_model from "@/models/Room";
import { NextRequest } from "next/server";
import game_utils from "@/utils/game_utils";
import crypto_utils from "@/utils/crypto_utils";
import state_model from "@/models/State";

export async function POST(req: NextRequest) {
    let token = req.cookies.get('token')?.value;
    let key = req.cookies.get('key')?.value;

    if (!token || !key) return new Response(JSON.stringify({ error: "Missing Credentials" }), { status: 401 })

    const data = {
        token: await tracking_utils.readJWT(token),
        key: await tracking_utils.readJWT(key)
    }

    if (!data.token || !data.key) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 401 })

    const { name, max_players, node } = await req.json();

    let connection = await mongoose.createConnection(process.env.MONGODB_URI as string);
    const Room: any = connection.model("Room", room_model.Schema);
    const room = await Room.findById(data.key.room.id);

    if (!room) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 404 });
    if (room.status != "uninstantiated") return new Response(JSON.stringify({ error: "Room Already Started" }), { status: 409 });

    room.name = name;
    room.max_players = max_players;
    room.node_id = node;
    room.node_uri = game_utils.servers[parseInt(node.replace("GS_", ""))].uri;
    room.node_name = game_utils.servers[parseInt(node.replace("GS_", ""))].name;

    room.status = "idle";

    await Room.findOneAndUpdate(
        { _id: data.key.room.id },
        room
    );

    connection.close();
    connection = mongoose.createConnection(room.node_uri);

    const State: any = connection.model("State", state_model.Schema);
    const state = new State({
        room_id: room._id,
        players: [data.key.user],
        state: {
            last_update: Date.now(),
            id: 0,
            screen: "idle"
        },
        records: {}
    });

    await state.save();

    connection.close();

    data.key.room.node = node;
    data.key.room.state = state._id;

    const roomKey = await crypto_utils.jwtSign(data.key);

    return new Response(JSON.stringify({
        "key": roomKey,
        "status": "success"
    }));
}