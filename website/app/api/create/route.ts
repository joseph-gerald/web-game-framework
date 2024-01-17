import tracking_utils from "@/utils/tracking_utils";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { ipAddress } from "@vercel/edge";
import client from '../_db';

import Session from "@/models/Session";

client.db("KongsberGuessr").collection("users");

export async function POST(req: Request) {
  if (tracking_utils.isNotJSON(req)) {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
  }

  const { username, fp } = await req.json();
  const fingerprint = await tracking_utils.process(fp.hash, fp.data, req.headers.get("user-agent") as string)
  const ip_address = req.headers.get("cf-connecting-ip") || ipAddress(req) || "null";

  if (!fingerprint.passed) {
    return new Response(JSON.stringify({ error: "Invalid Fingerprint" }), { status: 400 })
  }

  const session = new Session({
    display_name: username + " " + fingerprint.emoji,
    fingerprint_hash: fingerprint.hash,
    fingerprint_data: JSON.stringify(fingerprint.data_object),
    ip_address
  })
  
  
  await session.save();

  const session_id = session._id;

  const final_username = username + " " + fingerprint.emoji;

  const token = jwt.sign(
    {
      username: final_username,
      session_id
    }, process.env.SECRET_KEY as string,
    {
      expiresIn: "1h"
    }
  )

  return new Response(JSON.stringify({ token, username: final_username }))
}