import { db } from "./index";
import { users, contactInfo } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword =
      process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: "Admin",
        email: adminEmail,
        emailVerified: true,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Admin user created");
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log("⚠️  Please change the password after first login!");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create default contact info
    const existingContactInfo = await db.select().from(contactInfo).limit(1);

    if (existingContactInfo.length === 0) {
      await db.insert(contactInfo).values({
        email: "contact@example.com",
        phone: "+1234567890",
        address: "Your Address",
        linkedIn: "https://linkedin.com/in/yourprofile",
        github: "https://github.com/yourusername",
        twitter: "https://twitter.com/yourhandle",
        website: "https://yourwebsite.com",
      });

      console.log("✅ Default contact info created");
    } else {
      console.log("ℹ️  Contact info already exists");
    }

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
