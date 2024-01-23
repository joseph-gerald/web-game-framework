import tracking_utils from "@/utils/tracking_utils";
import state_model from "@/models/State";
import { NextRequest } from "next/server";
import mongoose from 'mongoose';
import game_utils from "@/utils/game_utils";

const handlers = [
    new ((await (import("./handlers/chat_handler"))).default)(),
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

    let start = Date.now();

    const state = await State.findById(new mongoose.Types.ObjectId(data.key.room.state)).select('state records').lean();
    console.log(`[SYNC] Fetched state in ${Date.now() - start}ms`);


    if (!state) return new Response(JSON.stringify({ error: "Could not find room" }), { status: 404 });

    state.state.id++;
    state.records ??= {};

    const newRecord = [];

    for (const handler of handlers) newRecord.push(...handler.handle(data, state, queue.filter((event: any) => event.target == handler.name)));

    const filtered = newRecord.filter((x: any) => x != null);

    if (filtered.length != 0) {
        state.records[state.state.id] = filtered;
    }

    for (const [key, value] of Object.entries(state.records)) {
        if (state_id != -1 && key > state_id) {
            for (const event of value as any) {
                // TODO: Implement visibility
                if (event.visibility == "public") events.push({ ...event, id: key });
            }
        }
    }

    start = Date.now();

    await State.findOneAndUpdate(
        { _id: data.key.room.state },
        state,
        { new: true, upsert: true }
    );

    //console.log(`[SYNC] Updated state in ${Date.now() - start}ms`);

    const payload = {
        state_id: state.state.id,
        events
    };

    connection.close();

    return new Response(JSON.stringify(payload));
}