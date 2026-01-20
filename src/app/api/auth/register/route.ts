import {NextRequest, NextResponse} from 'next/server';
import {registerSchema} from "@/schema/register";
import {registerUser} from "@/services/auth.service";
import {ZodError} from "zod";
import {Prisma} from "@/generated/prisma";

export async function POST(req: NextRequest) {
    try {
        const json = await req.json();
        const parsed = registerSchema.parse(json);
        const user = await registerUser(parsed);
        return NextResponse.json({
            id: user.id, email: user.email, name: user.name
        }, {status: 201});
    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json({
                error: `Validation Failed`,
                issues: err.errors
            }, {status: 400})
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return NextResponse.json({
                error: `Email already registered`
            }, {status: 409})
        }

        console.log(error);
        return NextResponse.json({
            error: `Internal Server Error`
        }, {
            status: 500
        })
    }
}