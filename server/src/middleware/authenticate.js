import { verifyAccessToken } from "../utils/token.js";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check whether the Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const error = new Error("Authentication required");
            error.statusCode = 401;
            throw error;
        }

        // Extract the token from the Bearer header
        const token = authHeader.split(" ")[1];

        if (!token) {
            const error = new Error("Authentication required");
            error.statusCode = 401;
            throw error;
        }

        // Verify the token
        const decodedToken = verifyAccessToken(token);

        req.user = {
            userId: decodedToken.userId,
        };

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
        error.name === "NotBeforeError" )
        {
            error.statusCode = 401;
            error.message = "Invalid or expired token";
        }

        next(error);
    }
};
