import tracking_utils from "@/utils/tracking_utils";
import jwt from "jsonwebtoken";
import { ipAddress } from "@vercel/edge";
import client from '@/app/api/_db';

import Session from "@/models/Session";

client.db("wgf-demo").collection("rooms");

export async function POST(req: Request) {
    if (tracking_utils.isNotJSON(req)) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
    }
    
}