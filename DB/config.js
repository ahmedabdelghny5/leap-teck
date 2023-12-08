import mongoose from 'mongoose';


export const DBConnection = async () => {
    return mongoose.connect(process.env.atlasURL).then(() => {
        console.log("DB connection established");
    }).catch(err => {
        console.log("DB connection error: ", err);
    })
}