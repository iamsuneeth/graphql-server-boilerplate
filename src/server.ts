import { GraphQLServer } from "graphql-yoga";
import fetchScehma from "./utils/schema";
import * as Redis from "ioredis";
import { User } from "./entity/User";

const redis = new Redis();

const server = new GraphQLServer({
  schema: fetchScehma(),
  context: ({ request }) => ({
    url: `${request.protocol}://${request.host}`,
    redis
  })
});

server.express.get("/confirm/:id", async (request, response) => {
  const id = request.params.id;
  const userId = await redis.get(id);
  if (userId) {
    await User.update({ id: userId }, { confirmed: true });
  }
  response.send("ok");
});

export default server;
