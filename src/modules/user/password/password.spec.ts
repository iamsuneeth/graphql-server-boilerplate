import { TestClient } from "../../../test/utils/TestClient";
import * as faker from "faker";
import { prisma } from "../../../../config/prisma/prisma-client";
import { createUser } from "../../../test/utils/TestHelper";

let client: TestClient;
faker.seed(Date.now() + 3);
const user = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password(),
  confirmed: true
};

beforeAll(async () => {
  client = new TestClient();
  await createUser(user);
});

describe("Forgot password tests", () => {
  test("forgot password change", async () => {
    let response = await client.login(user.email, user.password);
    response = await client.sendForgotPasswordLink();
    expect(response.body.data.sendForgotPasswordEmailLink).toBeTruthy();
    response = await client.me();
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.me.name).toBe("anonymous");
    response = await client.login(user.email, user.password);
    const dbUser = await prisma.user({
      email: user.email
    });
    if (dbUser) {
      expect(dbUser.locked).toBeTruthy();
    }
  });
});
