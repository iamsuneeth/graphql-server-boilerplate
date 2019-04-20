import { GraphQLServer } from "graphql-yoga";
import fetchScehma from "./utils/schema";
import redis from "./redis";
import mailRouter from "./routes/mail";
import "dotenv/config";

const server = new GraphQLServer({
  schema: fetchScehma(),
  context: ({ request }) => ({
    url: `${request.protocol}://${request.hostname}`,
    redis
  })
});

server.express.use(mailRouter);

export default server;
