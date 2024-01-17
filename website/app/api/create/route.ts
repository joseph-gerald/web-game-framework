import tracking_utils from "@/utils/tracking_utils";

export async function POST(req: Request) {
  const { username, fp } = await req.json();
  const fingerprint = await tracking_utils.process(fp.hash, fp.data, req.headers.get("user-agent") as string)

  console.log(fingerprint)

  return Response.json({ hello: 1 })
}