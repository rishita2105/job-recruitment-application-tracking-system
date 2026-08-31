import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";


const port = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
