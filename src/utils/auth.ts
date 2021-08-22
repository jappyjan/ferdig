import {getEnvVar} from './env';
import jwt, {JwtPayload} from 'jsonwebtoken';
import User from '../entity/Users/User';
import {Req} from '@tsed/common';

export async function auth(token: string): Promise<JwtPayload> {
    if (!token) {
        return Promise.reject('JWT not provided');
    }

    const secret = getEnvVar('AUTH_JWT_SECRET', 'string');
    return new Promise<JwtPayload>((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(decoded as JwtPayload);
        });
    });
}

export function getUserFromRequest(req: Req): User | null {
    const user = req.user as User | null;

    if (!user) {
        return null;
    }

    if (user.id === 'anonymous') {
        return null;
    }

    return user;
}
