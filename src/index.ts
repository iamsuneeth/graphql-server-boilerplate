import "reflect-metadata";
import server from "./server";
import createtypeORMConnection from "./utils/typeORMConnection";
import { formatError } from "./utils/errorFormatter";

const startServer = async () => {
  await createtypeORMConnection();
  await server.start(
    {
      formatError
    },
    () => console.log("Server is running on localhost:4000")
  );
};

startServer();
