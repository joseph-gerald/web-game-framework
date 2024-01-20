import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import tracking_utils from './utils/tracking_utils'

export async function middleware(request: NextRequest) {
  let token = request.cookies.get('token')
  const initial = request.headers.get("sec-fetch-mode") === "navigate"

  if (!token && !request.url.includes('/new') && initial) {
    console.log(request.url, initial)

    if (request.method === "POST") return NextResponse.error();

    return NextResponse.redirect(new URL('/new', request.url))
  }

  if (!token?.value) return NextResponse.next();

  const data = await tracking_utils.readJWT(token.value);
  console.log(data)
  if (data) {
    if (request.url.includes('/new') && token) return NextResponse.redirect(new URL('/', request.url))

    return NextResponse.next();
  } else {
    if (request.url.includes('/new')) return NextResponse.next();

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