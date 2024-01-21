import tracking_utils from "@/utils/tracking_utils";
import { client } from '@/app/api/_db';

client.db("wgf-demo").collection("rooms");

export async function POST(req: Request) {
    if (tracking_utils.isNotJSON(req)) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
    }
    
}