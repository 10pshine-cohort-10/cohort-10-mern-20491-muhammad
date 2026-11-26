import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    if (!expiresIn) {
        throw new Error("JWT_EXPIRES_IN is not configured");
    }
    const token = jwt.sign(
        { userId },
        secret,
        { expiresIn }
    );

    return token;
};

export const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    const decodedToken = jwt.verify(token, secret)
    return decodedToken;
};
