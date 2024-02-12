import tracking_utils from "@/utils/tracking_utils";
import state_model from "@/models/State";
import { NextRequest } from "next/server";
import { mongoose } from '@/app/api/_db';
import game_utils from "@/utils/game_utils";
import crypto_utils from "@/utils/crypto_utils";

import ChatHandler from "./handlers/impl/system/chat";
import RoomHandler from "./handlers/impl/system/room";
import BoxGame from "./handlers/impl/box_game";

const handlers = [
    new ChatHandler(),
    new RoomHandler(),
    new BoxGame()
];

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const key = req.cookies.get('key')?.value;

    if (!token || !key) {
        return new Response(JSON.stringify({ error: "Missing Credentials" }), { status: 401 });
    }

    const data = {
        token: await tracking_utils.readJWT(token),
        key: await tracking_utils.readJWT(key)
    };

    const { queue, state_id, hashes } = await req.json();

    if (!data.token || !data.key || !queue || state_id == undefined || !hashes) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 401 });
    }

    const events = [];
    const url = game_utils.servers[parseInt(data.key.room.node.replace("GS_", ""))].uri;

    const connection = mongoose.createConnection(url);
    const State = connection.model("State", state_model.Schema);
    const state = await State.findById(data.key.room.state).select('state records players');

    if (!state) {
        return new Response(JSON.stringify({ error: "Could not find room" }), { status: 404 });
    }

    const oldState = structuredClone(state.state);

    const newRecord = handlers.flatMap(handler => handler.handle(data, state, queue.filter((event: any) => handler.targets.includes(event.target))));

    const filtered = newRecord.filter((x: any) => x !== null);

    if (state_id === -1) {
        filtered.push({
            type: "system.connect",
            visibility: "public",
            timestamp: Date.now(),
            hash: crypto_utils.sha1(JSON.stringify(data) + "joinpublic" + Date.now()).substring(0, 6),
            data: data.token
        });
    }

    for (const [key, record] of ([...state.records as any, ...filtered as any] as any).entries()) {
        if (key === 0) continue;
        if (state_id !== -1 && key >= state_id && !(record.hash in hashes)) {
            // TODO: Implement visibility
            if (record.visibility === "public") {
                events.push({ ...record, id: key });
            }
        }
    }

    if (filtered.length != 0 || state.state != oldState) {
        //console.log(oldState, state.state)
        const diff = game_utils.computeDifference(oldState, state.state, "state.");

        let numericDiff = Object.keys(diff).filter(x => !isNaN(diff[x])).map(x => ({ [x]: diff[x] }));
        //numericDiff = numericDiff.reduce((a, b) => Object.assign(a, b), {});
        const otherDiffs = Object.keys(diff).filter(x => isNaN(diff[x])).map(x => ({ [x]: diff[x] }));

        //console.log(diff);
        console.log(numericDiff);

        const update = {
            $push: {
                'records': {
                    $each: filtered
                }
            },
            $inc: {
                ...(filtered.length != 0 ? {'state.id': 1} : {}),
            },
            $set: {
                'state.last_update': Date.now(), // Set the last_update time
                ...diff
            }
        };

        // Perform the update
        await State.updateOne(
            { _id: data.key.room.state },
            update,
            { upsert: true }
        );

        state.state.id++;
    }

    const payload = {
        ...(state_id === -1 ? { host: state.players[0].session_id === data.token.session_id } : {}),
        state_id: state.state.id + 1,
        events,
        state: { ...state.state, players: state.players }
    };

    await connection.close();

    return new Response(JSON.stringify(payload));
}
