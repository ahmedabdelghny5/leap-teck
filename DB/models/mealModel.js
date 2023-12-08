import mongoose, { Types } from 'mongoose';

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    howToSell: {
        type: String,
        required: true,
        enum: ['number', 'quantity'],
        default: 'number',
    }
    ,
    images: [{
        type: String,
    }],
    kind: {
        type: String,
        enum: ['drinks', 'foods', 'dessert'],
        required: true,
        default: 'foods',
    },
    category: {
        type: Types.ObjectId,
        ref: "category",
        required: true,
    },
    chefId: {
        type: mongoose.Types.ObjectId,
        ref: 'chef'
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected']
    },
    rate: {
        type: Number,
        default: 0
    },
    numberOfRates: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true,
})


const mealModel = mongoose.model('meal', mealSchema)
export default mealModel