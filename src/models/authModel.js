import mongoose, { model } from "mongoose";
const { Schema } = mongoose;
const authSchema = new Schema(
    {
        email: { type: String, required: true },
    },
    { timestamps: true }
);
export const authModel = model("users", authSchema);
