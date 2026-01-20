import jwt from 'jsonwebtoken';
import env from './env';

export function signAccess(payload: object) {
    return jwt.sign(payload, env.JWT_PRIVATE_KEY, {
        expiresIn: env.JWT_EXPIRES_IN
    })
}

export function signRefresh(payload: object) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {expiresIn: env.JWT_REFRESH_EXPIRES_IN});
}

export function verifyAccess(token: string) {
    return jwt.verify(token, env.JWT_PRIVATE_KEY);
}

export function verifyRefresh(token: string) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}