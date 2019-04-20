import createUserEmailLink from "./createUserEmailLink";
import { formatError } from "./errorFormatter";
import supertest = require("supertest");
import server from "../server";
import { User } from "../entity/User";
import * as Redis from "ioredis";
import createtypeORMConnection from "./typeORMConnection";
import { Connection } from "typeorm";

describe("create user confirmation email tests", () => {
  const app = server.createHttpServer({ formatError });
  const request = supertest(app);
  let userId: string;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createtypeORMConnection();
    const user = await User.create({
      email: "example@example",
      password: "sdfsdfdsfdsf",
      name: "test"
    }).save();
    userId = user.id;
  });

  test("successful confirmation link generation and user confirmation", async () => {
    const redis = new Redis();
    const link = await createUserEmailLink("", userId, redis);
    const splits = link.split("/");
    const id = splits[splits.length - 1];
    expect(await redis.get(id)).toBe(userId);
    const response = await request.get(link).expect(200);
    expect(response.text).toEqual("ok");
    const user = await User.findOne({
      id: userId
    });
    expect((user as User).confirmed).toBeTruthy();
    expect(await redis.get(id)).toBeNull();
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
  });
});
