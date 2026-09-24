const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 8, select: false },
        avatar: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset" },
        bio: { type: String, trim: true, maxlength: 500 },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("User", userSchema);
