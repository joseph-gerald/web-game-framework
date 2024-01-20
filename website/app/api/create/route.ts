import tracking_utils from "@/utils/tracking_utils";
import * as jose from 'jose'
import { ipAddress } from "@vercel/edge";
import client from '@/app/api/_db';

import Session from "@/models/Session";
import crypto_utils from "@/utils/crypto_utils";

client.db("wgf-demo").collection("users");
const emojiPattern = /\p{Emoji}/u;

export async function POST(req: Request) {
  if (tracking_utils.isNotJSON(req)) {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
  }

  const { username, fp } = await req.json();
  const fingerprint = await tracking_utils.handle(fp.hash, fp.data, req.headers.get("user-agent") as string)
  const ip_address = req.headers.get("cf-connecting-ip") || ipAddress(req) || "null";

  if (emojiPattern.test(username)) {
    return new Response(JSON.stringify({ error: "Invalid Username" }), { status: 400 })
  }

  if (!fingerprint.passed) {
    return new Response(JSON.stringify({ error: "Invalid Fingerprint" }), { status: 400 })
  }

  const session = new Session({
    display_name: username + " " + fingerprint.emoji,
    fingerprint: {
      hash: fingerprint.hash,
      data: fingerprint.data_object
    },
    ip_address
  })


  await session.save();

  const session_id = session._id;

  const final_username = username + " " + fingerprint.emoji;

  const token = await crypto_utils.jwtSign(
    {
      username: final_username,
      session_id
    });

  return new Response(JSON.stringify({ token, username: final_username }))
}