import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import tracking_utils from './utils/tracking_utils'
import game_utils from './utils/game_utils'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function middleware(request: NextRequest) {
  let token = request.cookies.get('token')
  let key = request.cookies.get('key')
  const initial = request.headers.get("sec-fetch-mode") === "navigate"

  const sessionValidation = await validateSession(request, token, initial);
  const roomKeyValidation = await validateRoomKey(request, key, token);

  //if (initial) console.log(sessionValidation, roomKeyValidation)

  if (sessionValidation) return sessionValidation;
  if (roomKeyValidation) return roomKeyValidation;
}

async function validateRoomKey(request: NextRequest, key: RequestCookie | undefined, token: RequestCookie | undefined) {
  const pathname = request.nextUrl.pathname;
  if (pathname.indexOf("/setup") == -1) return;

  if (!key?.value || !token?.value) return NextResponse.redirect(new URL('/', request.url));

  const data = {
    token: await tracking_utils.readJWT(token.value),
    key: await tracking_utils.readJWT(key.value)
  }

  if (!data.token || !data.key ||
    data.token.session_id != data.key.user.session_id) return NextResponse.redirect(new URL('/', request.url))

  const referredCode = request.headers.get("referer")?.split("/").pop() || pathname.split("/").pop();
  const roomCode = data.key.room.code;

  if (referredCode !== roomCode) return NextResponse.redirect(new URL('/', request.url))

  //console.log(data)
}

async function validateSession(request: NextRequest, token: RequestCookie | undefined, initial: boolean) {
  if (!token && !request.url.includes('/new') && initial) {
    //if (game_utils.DEBUG) console.log(request.url, initial)

    if (request.method === "POST") return NextResponse.error();

    return NextResponse.redirect(new URL('/new', request.url))
  }

  if (!token?.value) return;

  const data = await tracking_utils.readJWT(token.value);

  if (data) {
    if (request.url.includes('/new') && token) return NextResponse.redirect(new URL('/', request.url))

    return;
  } else {
    if (request.url.includes('/new')) return;

    return NextResponse.redirect(new URL('/new', request.url));
  }
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}