import { Connection } from "typeorm";
import createtypeORMConnection from "../../../utils/typeORMConnection";
import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";
import * as faker from "faker";

let client: TestClient;

let connection: Connection;

const user = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password(),
  confirmed: true
};

beforeAll(async () => {
  connection = await createtypeORMConnection();
  client = new TestClient();
  await User.create(user).save();
});

afterAll(async () => {
  if (connection) {
    await connection.close();
  }
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
    const dbUser = await User.findOne({
      email: user.email
    });
    if (dbUser) {
      expect(dbUser.locked).toBeTruthy();
    }
  });
});
