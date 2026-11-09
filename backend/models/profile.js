import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, required: true, match: [/^[0-9]{10}$/, "Invalid phone number"] },
});

const profileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        firstName: { type: String, required: true },
        lastName: { type: String, required: true },

        age: Number,
        dob: Date,

        phone: { type: String, required: true, match: [/^[0-9+\s-]{10,15}$/, "Invalid phone number"] },

        bloodGroup: String,
        medicalNote: String,

        emergencyContacts: {
            type: [contactSchema],
            validate: [
                (val) => val.length >= 3 && val.length <= 5,
                "3 to 5 contacts required",
            ],
        },

        address: {
            line1: { type: String, required: true },
            line2: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
        },

        safeZoneRadius: { type: Number, default: 100 }, // meters
    },
    { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
