import createtypeORMConnection from "../../../utils/typeORMConnection";
import { User } from "../../../entity/User";
import { Connection } from "typeorm";
import { GenericError } from "../../../errors/genericError";
import constants from "../../../constants";
import { TestClient } from "../../../utils/TestClient";
import * as faker from "faker";
let client1: TestClient;
let client2: TestClient;
let connection: Connection;

const user = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password()
};

const confirmedUser = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password(),
  confirmed: true
};

const lockedUser = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password(),
  confirmed: true,
  locked: true
};

beforeAll(async () => {
  connection = await createtypeORMConnection();
  await User.create(user).save();
  await User.create(confirmedUser).save();
  await User.create(lockedUser).save();
  client1 = new TestClient();
  client2 = new TestClient();
});

afterAll(async () => {
  if (connection) {
    await connection.close();
  }
});

describe("login tests", () => {
  test("Invalid login due to wrong email id", async () => {
    const { body: response } = await client1.login(
      faker.internet.email(),
      user.password
    );
    expect(response.data).toBeNull();
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toMatchObject({
      type: GenericError.VALIDATION_ERROR,
      state: {
        email: [
          {
            code: constants.errors.validation.INVALID_CREDENTIALS,
            path: "email"
          }
        ]
      }
    });
  });

  test("Invalid login due to email verification pending", async () => {
    const { body: response } = await client1.login(user.email, user.password);
    expect(response.data).toBeNull();
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toMatchObject({
      type: GenericError.VALIDATION_ERROR,
      state: {
        email: [
          {
            code: constants.errors.validation.EMAIL_VERIFICATION_PENDING,
            path: "email"
          }
        ]
      }
    });
  });

  test("Invalid login due to locked status", async () => {
    const { body: response } = await client1.login(
      lockedUser.email,
      lockedUser.password
    );
    expect(response.data).toBeNull();
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toMatchObject({
      type: GenericError.VALIDATION_ERROR,
      state: {
        email: [
          {
            code: constants.errors.validation.USER_LOCKED,
            path: "email"
          }
        ]
      }
    });
  });

  test("Success login for verified user", async () => {
    let { body: response } = await client1.login(
      confirmedUser.email,
      confirmedUser.password
    );
    expect(response.data).not.toBeNull();
    expect(response.data.login).toBeTruthy();

    response = await client1.me();
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.me.email).toBe(confirmedUser.email);
  });

  test("anonymous user response for non logged in user", async () => {
    const { body: response } = await client2.me();
    expect(response.data).not.toBeNull();
    expect(response.data.me.name).toBe("anonymous");
  });
});

describe("logout tests", () => {
  test("logout logged in user", async () => {
    const { body: loginResponse } = await client1.login(
      confirmedUser.email,
      confirmedUser.password
    );
    expect(loginResponse.data).not.toBeNull();
    expect(loginResponse.data.login).toBeTruthy();
    const { body: logoutResponse } = await client1.logout();
    expect(logoutResponse.data.logout).toBeTruthy();
    const { body: meResponse } = await client1.me();
    expect(meResponse.data).not.toBeNull();
    expect(meResponse.data.me.name).toBe("anonymous");
  });

  test("try to logout anonymous user", async () => {
    const { body: response } = await client2.logout();
    expect(response.data.logout).toBeTruthy();
  });
});

describe("multi session tests", () => {
  test("logout clears all existing sessions", async () => {
    await client1.login(user.email, user.password);

    await client2.login(user.email, user.password);

    let { body: response1 } = await client1.me();
    let { body: response2 } = await client2.me();
    expect(response1).toEqual(response2);
    await client1.logout();

    response1 = await client1.me();
    response2 = await client2.me();
    expect(response1.body).toEqual(response2.body);
  });
});
