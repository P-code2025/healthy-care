const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createTestUser() {
    const email = "test@test.com";
    const password = "password123";
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log(`✅ Test user already exists: ${email}`);
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Password: ${password}`);
            return;
        }

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name: "Test User",
                age: 25,
                gender: "Male",
                heightCm: 175,
                weightKg: 70,
                goal: "Maintain weight",
                activityLevel: "Moderate",
                exercisePreferences: { yoga: true, gym: false },
            },
        });

        console.log("✅ Test user created successfully!");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`👤 User ID: ${user.id}`);
    } catch (error) {
        console.error("❌ Error creating test user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
