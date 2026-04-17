import mongoose from "mongoose";
import Logger from "../utils/logger.js";

// Cấu hình mongoose (tránh warning + tối ưu)
mongoose.set("strictQuery", true);

// Hàm delay (dùng cho retry)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hàm connect DB chính
const connectDB = async (retries = 5) => {
  const MONGO_URI = process.env.MONGODB_URI;

  if (!MONGO_URI) {
    Logger.error("❌ MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    Logger.success(`✅ MongoDB Connected`);
    Logger.info(`📡 Host: ${conn.connection.host}`);
    Logger.info(`📦 DB Name: ${conn.connection.name}`);
  } catch (error) {
    Logger.error("❌ MongoDB Connection Error:", error.message);

    if (retries > 0) {
      Logger.warn(`🔄 Retrying connection... (${retries} attempts left)`);
      await delay(3000);
      return connectDB(retries - 1);
    }

    Logger.error("💥 Failed to connect to MongoDB after multiple attempts");
    process.exit(1);
  }
};

// Lắng nghe sự kiện mongoose
mongoose.connection.on("connected", () => {
  Logger.success("📶 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  Logger.error("⚠️ Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  Logger.warn("🔌 Mongoose disconnected");
});

// Tự reconnect khi mất kết nối (optional)
const handleReconnect = () => {
  mongoose.connection.on("disconnected", async () => {
    Logger.warn("🔄 Trying to reconnect MongoDB...");
    await connectDB();
  });
};

handleReconnect();

export default connectDB;
