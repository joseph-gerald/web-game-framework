import tracking_utils from "@/utils/tracking_utils";
import client from '@/app/api/_db';
import Room from "@/models/Room";

client.db("wgf-demo").collection("rooms");

export async function POST(req: Request) {
    let token = req.headers.get('authorization');

    if (!token) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })

    const data = await tracking_utils.readJWT(token);

    if (!data) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })

    const rooms = await client.db("wgf-demo").collection("rooms").find({}).toArray();
    const codes = rooms.map(x => x.code);

    let code = Math.random().toString(36).substring(2, 2 + 4).toUpperCase();
    const role = "host";
    const session = data.session_id;

    while (codes.includes(code)) {
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    const room = new Room({
        code,
        status: "uninstantiated",
        host: session,
        players: [{
            role,
            session,
            username: data.username,
            data: {}
        }],
    })

    await room.save();

    const roomKey = {
        room: {
            code,
            id: room._id
        },
        user: {
            role,
            session,
            username: data.username
        }
    }

    return new Response(JSON.stringify(roomKey))
}