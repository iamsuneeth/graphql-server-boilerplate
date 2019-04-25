import { Connection } from "typeorm";
import createtypeORMConnection from "../../../utils/typeORMConnection";
import { User } from "../../../entity/User";
import constants from "../../../constants";
import { GenericError } from "../../../errors/genericError";
import { TestClient } from "../../../utils/TestClient";
import * as faker from "faker";

let client1: TestClient;

let connection: Connection;

const user = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password()
};
beforeAll(async () => {
  connection = await createtypeORMConnection();
  client1 = new TestClient();
  await User.create(user).save();
});

afterAll(async () => {
  if (connection) {
    await connection.close();
  }
});

describe("Register user", () => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const name = faker.name.findName();
  const invalidEmail = "dsfdsfsd";

  test("Successful registration", async () => {
    const { body: response } = await client1.register(email, password, name);
    expect(response.data.register).toBeTruthy();
    const user = await User.findOne({
      email
    });
    expect(user).toBeDefined();
  });

  test("Duplicate email id failure", async () => {
    const { body: response } = await client1.register(
      user.email,
      user.password,
      user.name
    );
    expect(response.data).toBeNull();
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toMatchObject({
      type: GenericError.VALIDATION_ERROR,
      state: {
        email: [
          {
            code: constants.errors.validation.EMAIL_IN_USE,
            path: "email"
          }
        ]
      }
    });
  });

  test("Invalid email id failure", async () => {
    const { body: response } = await client1.register(
      invalidEmail,
      user.password,
      user.name
    );
    expect(response.data).toBeNull();
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toMatchObject({
      type: GenericError.VALIDATION_ERROR,
      state: {
        email: [
          {
            code: constants.errors.validation.EMAIL_FORMAT_ERROR,
            path: "email"
          }
        ]
      }
    });
  });
});