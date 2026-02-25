import { SignJWT, jwtVerify } from 'jose';

const getSecretKey = () => {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error('AUTH_SECRET environment variable is missing.');
    }
    return new TextEncoder().encode(secret);
};

export async function signToken(payload: any, expiresIn: string = '1d') {
    try {
        const secretKey = getSecretKey();
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(expiresIn)
            .sign(secretKey);

        return token;
    } catch (error) {
        console.error('Error signing token:', error);
        throw new Error('Failed to sign token');
    }
}

export async function verifyToken(token: string) {
    try {
        const secretKey = getSecretKey();
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        // Return null for invalid or expired tokens
        console.error('Token verification failed:', error);
        return null;
    }
}
