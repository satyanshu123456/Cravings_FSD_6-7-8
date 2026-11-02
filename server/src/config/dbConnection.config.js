import dns from "node:dns";
import mongoose from "mongoose";

// Use Google & Cloudflare DNS to resolve querySrv ETIMEOUT on ISPs (e.g. Jio, Airtel, Windows DNS)
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (dnsErr) {
  // Continue with default DNS if custom DNS cannot be configured
}

const connectDB = async (retries = 3) => {
  const mongoUri = process.env.MONGO_DB_URI || process.env.DATABASE_URL;
  if (!mongoUri || typeof mongoUri !== "string") {
    console.error(
      "MongoDB connection string is not defined. Set MONGO_DB_URI or DATABASE_URL in your .env",
    );
    return;
  }

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("Mongo DB connected Successfully");
      console.log("DB Host :", conn.connection.host);
      console.log("DB Name :", conn.connection.name);

      // Ensure partial unique index on clerkUserId
      try {
        const db = mongoose.connection.db;
        const usersCollection = db.collection("users");
        const indexes = await usersCollection.indexes();
        const hasClerkIndex = indexes.some((ix) => ix.name === "clerkUserId_1");
        if (hasClerkIndex) {
          try {
            await usersCollection.dropIndex("clerkUserId_1");
            console.log("Dropped existing clerkUserId_1 index");
          } catch (dropErr) {
            console.log("Could not drop clerkUserId_1 index:", dropErr.message);
          }
        }

        await usersCollection.createIndex(
          { clerkUserId: 1 },
          {
            unique: true,
            partialFilterExpression: { clerkUserId: { $exists: true, $ne: null } },
          },
        );
      } catch (indexErr) {
        // Non-critical index error
      }
      return;
    } catch (error) {
      retries -= 1;
      console.error(
        `MongoDB connection attempt failed: ${error.message}. Retries left: ${retries}`,
      );

      if (retries === 0) {
        console.error(
          "\n❌ MongoDB Connection Failed.\n" +
            "If you see 'querySrv ETIMEOUT', please check:\n" +
            "1. MongoDB Atlas Network Access: Whitelist your IP (Allow from Anywhere: 0.0.0.0/0)\n" +
            "2. Internet connection / DNS: Ensure internet is connected without restrictive proxy/firewall\n" +
            "3. Or use MongoDB Atlas Standard connection string (without +srv)\n",
        );
      } else {
        await new Promise((res) => setTimeout(res, 2500));
      }
    }
  }
};

export default connectDB;
