import mongoose from 'mongoose';



const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    chefId: {
        type: mongoose.Types.ObjectId,
        ref: 'chef'
    },
    meals: [{
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
}, {
    timestamps: true
})

const cartModel = new mongoose.model('cart', cartSchema)
export default cartModel
