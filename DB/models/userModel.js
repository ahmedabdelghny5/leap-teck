import mongoose from 'mongoose';
import crypto from "crypto-js";

const userSchema = new mongoose.Schema({
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
    favorites: [{
        type: mongoose.Types.ObjectId,
        ref: 'meal'
    }],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
    },
    code: {
        type: String,
    },
    role: {
        type: String,
        default: 'user'
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    socketId:{
        type: String,
    }

}, {
    timestamps: true,
})

userSchema.post('find', (data, next) => {
    data.map(user => {
        user.phone = crypto.AES.decrypt(user.phone, process.env.encryption).toString(crypto.enc.Utf8)
    })
    next()
})
userSchema.post('findOne', (data, next) => {
    if (data?.phone) {
        data.phone = crypto.AES.decrypt(data.phone, process.env.encryption).toString(crypto.enc.Utf8)
    }
    next()
})
const userModel = mongoose.model('user', userSchema)
export default userModel