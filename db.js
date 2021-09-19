import mongoose from 'mongoose';

export const connectDB = () => {
    return mongoose.connect('mongodb://localhost/authentication-node').then(connected => {
        console.log("Database Connected.");
    })
}

// export { connectDB };