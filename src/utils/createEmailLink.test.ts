import {
  createUserEmailLink,
  forgotPasswordEmailLink
} from "./createEmailLink";
import * as Redis from "ioredis";
import { TestClient } from "./TestClient";
import { GenericError } from "../errors/genericError";
import constants from "../constants";
import * as faker from "faker";
import { prisma, User } from "../../config/prisma/prisma-client";

describe("create user confirmation email tests", () => {
  let user1: User;
  let user2: User;
  let client: TestClient;

  const newPassword = "newPassword";

  beforeAll(async () => {
    client = new TestClient();
    user1 = await prisma.createUser({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password()
    });
    user2 = await prisma.createUser({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(),
      confirmed: true
    });
  });

  test("successful confirmation link generation and user confirmation", async () => {
    const redis = new Redis();
    const link = await createUserEmailLink("", user1.id, redis);
    const splits = link.split("/");
    const id = splits[splits.length - 1];
    expect(await redis.get(id)).toBe(user1.id);
    const response = await client.get(link).expect(200);
    expect(response.text).toEqual("ok");
    const user = await prisma.user({
      id: user1.id
    });
    expect((user as User).confirmed).toBeTruthy();
    expect(await redis.get(id)).toBeNull();
  });

  test("successful forgot password link generation and reset", async () => {
    const redis = new Redis();
    const link = await forgotPasswordEmailLink("", user2.id, redis);
    const splits = link.split("/");
    const id = splits[splits.length - 1];
    expect(await redis.get(id)).toBe(user2.id);
    let response = await client
      .forgotPasswordChange(newPassword, id)
      .expect(200);
    expect(response.body.data.forgotPasswordChange).toBeTruthy();
    response = await client.login(user2.email, newPassword);
    expect(response.body.data.login).toBeTruthy();
    response = await client.login(user2.email, user2.password);
    expect(response.body.data).toBeNull();
    expect(await redis.get(id)).toBeNull();
    response = await client.forgotPasswordChange(newPassword, id).expect(200);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0]).toMatchObject({
      type: GenericError.VALIDATION_ERROR,
      state: {
        link: [
          {
            code: constants.errors.validation.PASSWORD_VERIFICATION_LINK_WRONG,
            path: "link"
          }
        ]
      }
    });
  });
});
