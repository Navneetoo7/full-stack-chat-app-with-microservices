import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDb = async () => {
    const url = process.env.MONGO_URL;
    if (!url) {
        throw new Error("MONGO_URL is not defined in environment variable");
    }
    try {
        await mongoose.connect(url, {
            dbName: "Chatappmicroserviceapp",
        });
        console.log("Connected to mongodb");
    }
    catch (error) {
        console.error("failed to connect to Mongodb", error);
        process.exit(1);
    }
};
export default connectDb;
//# sourceMappingURL=db.js.map