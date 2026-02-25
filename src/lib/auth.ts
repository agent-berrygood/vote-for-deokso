import { EncryptJWT, jwtDecrypt } from 'jose';

const getSecretKey = () => {
    let secret = process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error('AUTH_SECRET environment variable is missing.');
    }
    // JWE with A256GCM requires exactly 32 bytes (256 bits).
    if (secret.length < 32) {
        secret = (secret + '0'.repeat(32)).slice(0, 32);
    } else {
        secret = secret.slice(0, 32);
    }
    return new TextEncoder().encode(secret);
};

export async function signToken(payload: any, expiresIn: string = '1d') {
    try {
        const secretKey = getSecretKey();
        const token = await new EncryptJWT(payload)
            .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
            .setIssuedAt()
            .setExpirationTime(expiresIn)
            .encrypt(secretKey);

        return token;
    } catch (error) {
        console.error('Error encrypting token:', error);
        throw new Error('Failed to encrypt token');
    }
}

export async function verifyToken(token: string) {
    try {
        const secretKey = getSecretKey();
        const { payload } = await jwtDecrypt(token, secretKey);
        return payload;
    } catch (error) {
        // Return null for invalid or expired tokens
        console.error('Token decryption failed:', error);
        return null;
    }
}
