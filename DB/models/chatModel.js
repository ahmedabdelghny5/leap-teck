import mongoose from 'mongoose';



const chatSchema = new mongoose.Schema({
    userOne: {
        type: String,
        required:true
    },
    userTwo: {
        type: String,
        required:true
    },
    messages: [{
        to: {
            type: String,
            required:true
        },
        from: {
            type: String,
            required:true
        },
        message: {
            type: String,
            required: true
        }
    }],
}, {
    timestamps: true
})

const chatModel = new mongoose.model('chat', chatSchema)
export default chatModel
