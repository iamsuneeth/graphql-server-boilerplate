import "reflect-metadata";
import server from "./server";
import createtypeORMConnection from "./utils/typeORMConnection";
import { formatError } from "./utils/errorFormatter";

const cors = {
  credentials: true,
  origin: process.env.FRONTEND_HOST
};

const startServer = async () => {
  await createtypeORMConnection();
  await server.start(
    {
      formatError,
      cors
    },
    () => console.log("Server is running on localhost:4000")
  );
};

startServer();
