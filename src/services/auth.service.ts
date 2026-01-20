import argon2 from "argon2";
import {signAccess, signRefresh} from "@/lib/jwt";

interface RegisterUserPayload {
    email: string,
    password: string,
    name?: string
}

interface LoginPayload {
    email: string,
    password: string
}

export async function registerUser(payload: RegisterUserPayload) {
    const hash = await argon2.hash(payload.password);
    return prisma?.user.create(
        {
            data: {...payload, password: hash}
        });
}

export async function login(payload: LoginPayload) {
    const user = await prisma?.user.findUnique({where: {email: payload.email}});
    if (!user) return null;
    const ok = await argon2.verify(user.password, payload.password);
    if (!ok) return null;

    const access = signAccess({sub: user.id})
    const refresh = signRefresh({sub: user.id})
    return {user, access, refresh}
}