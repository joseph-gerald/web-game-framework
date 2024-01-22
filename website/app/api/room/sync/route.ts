import tracking_utils from "@/utils/tracking_utils";
import State from "@/models/State";
import { NextRequest } from "next/server";
import mongoose from 'mongoose';
import { MongoClient } from "mongodb";
import game_utils from "@/utils/game_utils";

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
    const client = new MongoClient(url);

    client.connect();

    mongoose.connect(url);

    client.db("master").collection("states");

    const state = await State.findById(data.key.room.state);
    state.state.id++;

    await State.findOneAndUpdate(
        { _id: data.key.room.state },
        state,
        { new: true, upsert: true }
    );

    return new Response(JSON.stringify({
        state_id: state.state.id,
        events
    }));
}