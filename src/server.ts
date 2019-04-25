import { GraphQLServer } from "graphql-yoga";
import fetchScehma from "./utils/schema";
import redis from "./redis";
import mailRouter from "./routes/mail";
import "dotenv/config";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import authMiddleware from "./middleware/auth";
import * as rateLimit from "express-rate-limit";
import * as rateLimitRedisStore from "rate-limit-redis";

const server = new GraphQLServer({
  schema: fetchScehma(),
  context: ({ request }) => ({
    url: `${request.protocol}://${request.hostname}`,
    redis,
    session: request.session,
    request
  }),
  middlewares: [authMiddleware]
});

const redisStore = connectRedis(session);
server.express.use(
  new rateLimit({
    store: new rateLimitRedisStore({
      client: redis
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
);
server.express.use(mailRouter);
server.express.use(
  session({
    name: "qid",
    store: new redisStore({}),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

export default server;
