import tracking_utils from "@/utils/tracking_utils";
import { mongoose } from '@/app/api/_db';
import room_model from "@/models/Room";
import { NextRequest } from "next/server";
import game_utils from "@/utils/game_utils";
import crypto_utils from "@/utils/crypto_utils";
import state_model from "@/models/State";

export async function POST(req: NextRequest) {
    let token = req.cookies.get('token')?.value;

    if (!token) return new Response(JSON.stringify({ error: "Missing Credentials" }), { status: 401 })

    const data = {
        token: await tracking_utils.readJWT(token)
    }

    if (!data.token) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 401 })

    const { code } = await req.json();

    let connection = await mongoose.createConnection(process.env.MONGODB_URI as string);
    const Room: any = connection.model("Room", room_model.Schema);
    const room = await Room.findOne({ code });
    connection.close();

    if (!room) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 404 });
    if (room.status == "uninstantiated") return new Response(JSON.stringify({ error: "Room Not Ready" }), { status: 409 });

    connection = await mongoose.createConnection(room.node_uri);

    const State: any = connection.model("State", state_model.Schema);
    const state = await State.findOne({ room_id: room._id });

    const date = Date.now();

    const update = {
        $push: {
            'records': {
                type: "join",
                visibility: "public",
                timestamp: date,
                hash: crypto_utils.sha1(JSON.stringify(data) + "joinpublic" + date).substring(0, 6),
                data: data.token
            }
        },
        $inc: {
            'state.id': 1
        },
        $set: {
            'state.last_update': Date.now()
        }
    };

    // Perform the update
    await State.updateOne(
        { _id: state._id },
        update,
        { upsert: true }
    );

    state.state.id++;

    connection.close();

    const key = await crypto_utils.jwtSign({
        room: {
            code,
            id: room._id,
            state: state._id,
            node: room.node_id
        },
        user: {
            role: "player",
            session: data.token.session_id,
            username: data.token.username
        }
    });

    return new Response(JSON.stringify({
        key,
        "status": "success"
    }));
}