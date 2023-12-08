import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    chefId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'chef'
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'done', 'doing', 'refused'],
        required: true,
        default: 'pending'
    },
    drivenStatus: {
        type: String,
        enum: ['cooking', 'waiting', 'in-rood', 'arrived'],
        default: 'waiting',
        required: true
    },
    items: [{
        meal: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'meal'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    address: {
        type: String,
        required: true
    },
    note: {
        type: String,
    },
    paid: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
})


const orderModel = mongoose.model('order', orderSchema)
export default orderModel