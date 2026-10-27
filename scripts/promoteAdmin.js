/**
 * One-time admin promotion script.
 *
 * Usage:
 *   node scripts/promoteAdmin.js
 *
 * Requires these environment variables (set in .env):
 *   MONGODB_URI          — your Atlas connection string
 *   ADMIN_PROMOTE_SECRET — the secret from .env (must match)
 *   ADMIN_EMAIL          — the email of the account to promote
 *   ADMIN_SECRET_INPUT   — the secret you are supplying at runtime
 *
 * Example:
 *   ADMIN_EMAIL=me@example.com ADMIN_SECRET_INPUT=mysecret node scripts/promoteAdmin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const secretInput = process.env.ADMIN_SECRET_INPUT;
  const correctSecret = process.env.ADMIN_PROMOTE_SECRET;

  if (!email || !secretInput || !correctSecret) {
    console.error(
      "❌  Missing required env vars: ADMIN_EMAIL, ADMIN_SECRET_INPUT, ADMIN_PROMOTE_SECRET"
    );
    process.exit(1);
  }

  if (secretInput !== correctSecret) {
    console.error("❌  Incorrect ADMIN_SECRET_INPUT. Promotion denied.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`✅  ${user.name} (${user.email}) has been promoted to admin.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Script error:", err.message);
  process.exit(1);
});
