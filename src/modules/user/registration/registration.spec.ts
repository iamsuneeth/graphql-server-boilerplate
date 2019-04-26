import constants from "../../../constants";
import { GenericError } from "../../../errors/genericError";
import * as faker from "faker";
import { prisma } from "../../../../config/prisma/prisma-client";
import { TestClient } from "../../../test/utils/TestClient";
import { createUser } from "../../../test/utils/TestHelper";
let client1: TestClient;
faker.seed(Date.now() + 2);
const user = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.internet.password()
};
beforeAll(async () => {
  client1 = new TestClient();
  await createUser(user);
});

describe("Register user", () => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const name = faker.name.findName();
  const invalidEmail = "dsfdsfsd";

  test("Successful registration", async () => {
    const { body: response } = await client1.register(email, password, name);
    expect(response.data.register).toBeTruthy();
    const user = await prisma.user({
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
