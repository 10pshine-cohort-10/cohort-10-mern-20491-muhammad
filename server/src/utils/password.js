
import bcrypt from "bcryptjs";

const rounds = 12;

export const hashPassword = async (plainPassword) => {
    const hashedPassword = await bcrypt.hash(
        plainPassword,
        rounds
    );

    return hashedPassword;
};

export const comparePassword = async (
    plainPassword,
    hashedPassword
) => {
    const isMatch = await bcrypt.compare(
        plainPassword,
        hashedPassword
    );

    return isMatch;
};
