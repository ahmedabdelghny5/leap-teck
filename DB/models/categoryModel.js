import mongoose from 'mongoose';



const categorySchema = new mongoose.Schema({
    nameEN: {
        type: String,
        required: true,
        unique: true,
        toLowerCase: true,
    },
    nameAR: {
        type: String,
        required: true,
        unique: true,
        toLowerCase: true,
    },
    image: {
        type: Object,
        required: [true, "image is required"]
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

categorySchema.virtual('meals', {
    localField: '_id',
    foreignField: "category",
    ref: 'meal'
})
const categoryModel = mongoose.model('category', categorySchema)
export default categoryModel
