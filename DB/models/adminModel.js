import mongoose from 'mongoose';
import crypto from "crypto-js";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'superAdmin'],
        default: 'admin',
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    },
    code: {
        type: String,
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    socketId: {
        type: String,
    }
}, {
    timestamps: true,
})
adminSchema.post('find', (data, next) => {
    console.log({ data, message: "HOKS" });
    data.map(user => {
        user.phone = crypto.AES.decrypt(user.phone, process.env.encryption).toString(crypto.enc.Utf8)
    })
    next()
})
adminSchema.post('findOne', (data, next) => {
    if (data) {
        data.phone = crypto.AES.decrypt(data.phone, process.env.encryption).toString(crypto.enc.Utf8)
    }
    next()
})

const adminModel = mongoose.model('admin', adminSchema)
export default adminModel