import app from './app';
import prisma from './models/prisma';

const PORT = process.env.PORT || 3000;

const startServer = async() => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL database successfully!");
    app.listen(PORT,()=> {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    })
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();