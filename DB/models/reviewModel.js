import mongoose, { Types } from 'mongoose';



const reviewSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    meal: {
        type: Types.ObjectId,
        ref: "meal",
    },
    chef:{
        type: Types.ObjectId,
        ref: "meal",
    },
    user: {
        type: Types.ObjectId,
        ref: "user",
        required: true,
    }
}, {
    timestamps: true
})

const reviewModel = mongoose.model('review', reviewSchema)
export default reviewModel
