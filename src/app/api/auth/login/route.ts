import {NextRequest, NextResponse} from "next/server";
import {login} from "@/services/auth.service";

export async function POST(req: NextRequest) {
    try {
        const {email, password} = await req.json();
        const res = await login({email, password});
        if (!res) return new NextResponse(JSON.stringify({message: "Invalid credentials"}), {status: 401});
        const response = NextResponse.json({user: {id: res.user.id, email: res.user.email, name: res.user.name}});
        response.cookies.set({
            name: "dox_access",
            value: res.access,
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
        response.cookies.set({
            name: "dox_refresh",
            value: res.refresh,
            httpOnly: true,
            path: "/refresh",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
        return response;
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: `Internal Server Error`
        }, {
            status: 500
        })
    }
}