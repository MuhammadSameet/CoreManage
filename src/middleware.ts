// (Only run on Next JS Server)

import { NextResponse, NextRequest } from "next/server";
import { publicRoutes, privateRoutes } from "./utils/routes";

function middleware(req: NextRequest) {

    const token = req?.cookies?.get('token')?.value || null;
    // console.log(`Token: ${token}`);

    const { pathname } = req.nextUrl;
    // console.log('Path: ', pathname);

    const isPublic = publicRoutes.includes(pathname);
    const isProtected = !isPublic;
    // console.log('Is Protected: ', isProtected);

    if (token && isPublic) {
        return NextResponse.redirect(new URL('/home', req.url));
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