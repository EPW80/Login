const mongoose = require("mongoose");
require("dotenv").config();

const fixDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log(
      "📋 Current indexes:",
      indexes.map((i) => ({ name: i.name, key: i.key }))
    );

    // Drop the problematic address_1 index
    try {
      await collection.dropIndex("address_1");
      console.log("🗑️ Dropped problematic address_1 index");
    } catch (error) {
      console.log("ℹ️ Index address_1 does not exist or already dropped");
    }

    // Find and remove duplicate null entries
    const nullAddressDocs = await collection
      .find({
        $or: [
          { address: null },
          { address: { $exists: false } },
          { publicAddress: null },
          { publicAddress: { $exists: false } },
        ],
      })
      .toArray();

    console.log(
      `📊 Found ${nullAddressDocs.length} documents with null addresses`
    );

    if (nullAddressDocs.length > 1) {
      // Keep the first one, remove the rest
      const idsToRemove = nullAddressDocs.slice(1).map((doc) => doc._id);
      const result = await collection.deleteMany({ _id: { $in: idsToRemove } });
      console.log(`🗑️ Removed ${result.deletedCount} duplicate null entries`);
    }

    // Create proper sparse unique indexes
    try {
      await collection.createIndex(
        { publicAddress: 1 },
        {
          unique: true,
          sparse: true,
          name: "publicAddress_unique_sparse",
          background: true,
        }
      );
      console.log("✅ Created sparse unique index for publicAddress");
    } catch (error) {
      console.log("ℹ️ publicAddress index already exists");
    }

    // Create index for email if you plan to use it
    try {
      await collection.createIndex(
        { email: 1 },
        {
          unique: true,
          sparse: true,
          name: "email_unique_sparse",
          background: true,
        }
      );
      console.log("✅ Created sparse unique index for email");
    } catch (error) {
      console.log("ℹ️ Email index already exists");
    }

    // Verify final state
    const finalIndexes = await collection.listIndexes().toArray();
    console.log(
      "📋 Final indexes:",
      finalIndexes.map((i) => ({ name: i.name, key: i.key }))
    );

    const finalCount = await collection.countDocuments();
    console.log(`📊 Total documents in collection: ${finalCount}`);

    console.log("🎉 Database fix completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing database:", error);
    process.exit(1);
  }
};

fixDatabase();
