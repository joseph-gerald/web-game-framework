import { NextRequest } from "next/server";
import { MongoClient } from 'mongodb';
import game_utils from "@/utils/game_utils";

async function pingDatabase(uri: string) {
    const startTime = Date.now();

    const client = new MongoClient(uri);

    try {
        await client.connect();
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        return;
    } finally {
        await client.close();
    }

    const endTime = Date.now();
    const ping = endTime - startTime;

    return ping;
}

export async function POST(req: NextRequest) {
    const { id } = await req.json();

    try {
        const servers = game_utils.servers;
        const uri = servers[parseInt(id.replace("GS_", ""))].uri;

        const ping = await pingDatabase(uri);
    
        return new Response(JSON.stringify({
            ping: ping
        }))
    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid server" }), { status: 404 });
    }
}