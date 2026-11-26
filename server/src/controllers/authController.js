import {registerUser,loginUser,findUserById,}
from "../services/authService.js";

export const register = async (req, res, next) => {
    try {
        const result = await registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "Account registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await loginUser(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await findUserById(req.user.userId);

        return res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};
