import tracking_utils from "@/utils/tracking_utils";
import state_model from "@/models/State";
import { NextRequest } from "next/server";
import mongoose from 'mongoose';
import game_utils from "@/utils/game_utils";

const handlers = [
    new ((await (import ("./handlers/chat_handler"))).default)(),
]

export async function POST(req: NextRequest) {
    let token = req.cookies.get('token')?.value;
    let key = req.cookies.get('key')?.value;

    if (!token || !key) return new Response(JSON.stringify({ error: "Missing Credentials" }), { status: 401 })

    const data = {
        token: await tracking_utils.readJWT(token),
        key: await tracking_utils.readJWT(key)
    }

    const { queue, state_id } = await req.json();

    if (!data.token || !data.key || !queue || !state_id) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 401 })

    const events: any[] = [];

    const url = game_utils.servers[parseInt(data.key.room.node.replace("GS_", ""))].uri;

    const connection = await mongoose.createConnection(url);

    const State: any = connection.model("State", state_model.Schema);
    const state = await State.findById(data.key.room.state);

    console.log(data.key.room.state)

    state.state.id++;
    state.state.records ??= [];

    for (const handler of handlers)  handler.handle(state.state, queue.filter((event: any) => event.target == handler.name));

    await State.findOneAndUpdate(
        { _id: data.key.room.state },
        state,
        { new: true, upsert: true }
    );

    const payload = {
        state_id: state.state.id,
        events
    };

    connection.close();

    return new Response(JSON.stringify(payload));
}