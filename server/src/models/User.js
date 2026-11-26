import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters long"],
            maxlength: [30, "Name cannot exceed 30 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [100, "Email cannot exceed 100 characters"],
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (document, returnedObject) => {
                delete returnedObject.password;
                delete returnedObject.__v;
                return returnedObject;
            },
        },
    }
);

const User = mongoose.model("User", userSchema);
export default User;