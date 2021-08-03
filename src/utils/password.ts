import {genSalt, hash, compare} from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    const salt = await genSalt(6);
    return await hash(password, salt);
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    return await compare(password, hashedPassword);
}
