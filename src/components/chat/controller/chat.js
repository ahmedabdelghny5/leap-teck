import chatModel from "../../../../DB/models/chatModel.js";



export const getChat = async (req, res, next) => {
    const dest = req.params.id
    const userId = req.user._id;
    const chat = await chatModel.findOne({
        $or: [
            { userOne: dest, userTwo: userId },
            { userTwo: dest, userOne: userId },
        ]
    })
    res.json({ message: 'done', chat })
}