import {getEnvVar} from './env';
import jwt, {JwtPayload} from 'jsonwebtoken';

export async function validateAuthJwt(token: string): Promise<JwtPayload> {
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
