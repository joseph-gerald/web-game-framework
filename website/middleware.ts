import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import * as jose from 'jose'

export async function middleware(request: NextRequest) {
  let token = request.cookies.get('token')
  const initial = request.headers.get("sec-fetch-mode") === "navigate"

  if (!token && !request.url.includes('/new') && initial) {
    console.log(request.url, initial)
    return NextResponse.redirect(new URL('/new', request.url))
  }

  if (!token?.value) return NextResponse.next();

  try {
    const { payload } = await jose.compactVerify(token.value, Buffer.from(process.env.SECRET_KEY as string));
    const data = JSON.parse(new TextDecoder().decode(payload))

    if (request.url.includes('/new') && token) return NextResponse.redirect(new URL('/', request.url))

    return NextResponse.next();
  } catch (error) {
    if (request.url.includes('/new')) return NextResponse.next();
    return NextResponse.redirect(new URL('/new', request.url));
  }
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}