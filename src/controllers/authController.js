import { authModel } from "../models/authModel.js";
import sendMail from "../../config/mailer/index.js";

export async function earlyAccess(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required", });
        };
        const existingUser = await authModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ success: false, message: "This email is already registered for early access", });
        };
        const earlyUser = await authModel.create({ email });
        await sendMail("early_access", "Link Rhinos - Enrollment Confirmed", email, {
            email: email,
        });
        return res.status(201).json({ success: true, message: "Successfully added to early access list", data: { id: earlyUser._id, email: earlyUser.email, }, });
    } catch (error) {
        console.error("Error in earlyAccess:", error);
        return res.status(500).json({ success: false, message: "Oops! Something went wrong on our end. Please try again later.", });
    };
};