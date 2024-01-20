import game_utils from '@/utils/game_utils';
import { MongoClient } from 'mongodb';

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

export async function POST(req: Request) {
  const servers = game_utils.servers;
  const data = await Promise.all(servers.map(async (server) => {
    const ping = await pingDatabase(server.uri);

    return {
      name: server.name,
      description: server.description,
      id: server.id,
      ping: ping + " ms"
    };
  }));

  return new Response(JSON.stringify(data))
}