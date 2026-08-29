import mongoose from "mongoose";
import dns from "dns";
import { DB_NAME } from "../constants.js";
import env from "./env.config.js";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const uri = new URL(env.mongoUri);

    if (uri.pathname === "/" || uri.pathname === "") {
      uri.pathname = `/${DB_NAME}`;
    }

    const connect = await mongoose.connect(uri.toString(), {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`\nMongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

// now the DB configration doesnot know where is the .env keys. its just configured by .env file only
// in previous project that secret was published. but now here its safe and ok
