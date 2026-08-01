// only connect to mongodb; that's its responsibility
import mongoose from "mongoose";
import dns from "dns";
import { DB_NAME } from "../constants.js";

// Force Node.js to use Google DNS to resolve MongoDB SRV records
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const mongoUrl =
      process.env.MONGODB_URL ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URI;

    if (!mongoUrl) {
      throw new Error(
        "Missing MongoDB connection string. Set MONGODB_URL in the .env file.",
      );
    }

    const uri = new URL(mongoUrl);

    if (uri.pathname === "/" || uri.pathname === "") {
      uri.pathname = `/${DB_NAME}`;
    }

    const connect = await mongoose.connect(uri.toString(), {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`\nMongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`MONGO_DB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
