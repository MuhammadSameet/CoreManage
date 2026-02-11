// (Only run on Next JS Server)

import { NextResponse, NextRequest } from "next/server";
import { publicRoutes, blockedRoutes } from "./utils/routes";

function middleware(req: NextRequest) {
    const token = req?.cookies?.get('token')?.value || null;
    const { pathname } = req.nextUrl;

    // Blocked routes: ALL roles get redirected to 404 (no one can access)
    if (blockedRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/404', req.url));
    }

    const isPublic = publicRoutes.includes(pathname);
    const isProtected = !isPublic;

    if (token && isPublic) {
        return NextResponse.redirect(new URL('/users', req.url));
    }

    if (!token && isProtected) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export default middleware;

export const config = {
    matcher: [
        "/((?!_next|fevion.ico|api).*)"
    ]
};