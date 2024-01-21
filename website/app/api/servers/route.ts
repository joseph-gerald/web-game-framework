import Room from '@/models/Room';
import game_utils from '@/utils/game_utils';
import tracking_utils from '@/utils/tracking_utils';
import { MongoClient } from 'mongodb';
import { NextRequest } from 'next/server';

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
  let token = req.cookies.get('token')?.value;
  let key = req.cookies.get('key')?.value;

  if (!token || !key) return new Response(JSON.stringify({ error: "Missing Credentials" }), { status: 401 })

  const data = {
    token: await tracking_utils.readJWT(token),
    key: await tracking_utils.readJWT(key)
  }

  if (!data.token || !data.key) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 401 })

  const referredCode = req.headers.get("referer")?.split("/").pop();
  const roomCode = data.key.room.code;

  if (referredCode !== roomCode) return new Response(JSON.stringify({ error: "Wrong Room" }), { status: 401 })

  try {
    const room = await Room.findById(data.key.room.id);

    if (!room || room.status == "instantiated") return new Response(JSON.stringify({ error: "Invalid request" }), { status: 404 });

    const servers = game_utils.servers;
    const pingData = await Promise.all(servers.map(async (server) => {
      const ping = await pingDatabase(server.uri);

      return {
        name: server.name,
        description: server.description,
        id: server.id,
        ping: ping + " ms"
      };
    }));

    return new Response(JSON.stringify(pingData))
  } catch (_) {
    return new Response(JSON.stringify({ error: "Failed to contact database" }), { status: 500 });
  }
}