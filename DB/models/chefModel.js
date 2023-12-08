import mongoose from 'mongoose';
import crypto from "crypto-js";

const chefSchema = new mongoose.Schema({
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
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
    },
    brandName: {
        type: String,
        required: true,
        unique: true,
    },
    profilePic: {
        type: String,
    },
    minCharge: {
        type: Number,
        default: 0
    },
    disc: {
        type: String,
        required: true
    },
    frontId: {
        type: String,
        required: true
    },
    backId: {
        type: String,
        required: true
    },
    menu: [{
        type: mongoose.Types.ObjectId,
        ref: 'meal'
    }],
    online: {
        type: Boolean,
        default: false
    },
    healthCertificate: {
        type: String
    },
    stock: {
        type: Number,
        default: 0
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
    },
    role: {
        type: String,
        default: 'chef'
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected']
    },
    points: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        default: 0
    },
    numberOfRates: {
        type: Number,
        default: 0
    },
    socketId:{
        type: String,
    }
    

}, {
    timestamps: true,
})
chefSchema.post('find', (data, next) => {
    data.map(user => {
        if (user.phone) {
            user.phone = crypto.AES.decrypt(user.phone, process.env.encryption).toString(crypto.enc.Utf8)
        }
    })
    next()
})
chefSchema.post('findOne', (data, next) => {
    if (data && data.phone) {
        data.phone = crypto.AES.decrypt(data.phone, process.env.encryption).toString(crypto.enc.Utf8)
    }
    next()
})

const chefModel = mongoose.model('chef', chefSchema)
export default chefModel

