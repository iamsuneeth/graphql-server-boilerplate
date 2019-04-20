import * as supertest from "supertest";
import { Connection } from "typeorm";
import server from "../../server";
import createtypeORMConnection from "../../utils/typeORMConnection";
import { User } from "../../entity/User";
import constants from "../../constants";
import { formatError } from "../../utils/errorFormatter";
import { GenericError } from "../../errors/genericError";

const app = server.createHttpServer({ formatError });
const request = supertest(app);

describe("Register user", () => {
  const email = "test@test.com";
  const password = "password";
  const name = "test";
  const invalidEmail = "dsfdsfsd";

  let connection: Connection;
  const registerMutation = `
  mutation {
    register(email:"${email}",password:"${password}",name:"${name}")
  }
  `;
  const registerMutation2 = `
  mutation {
    register(email:"${invalidEmail}",password:"${password}",name:"${name}")
  }
  `;

  beforeAll(async () => {
    connection = await createtypeORMConnection();
  });

  test("Successful registration", async () => {
    const response = await request
      .post("/")
      .send({
        query: registerMutation
      })
      .expect(200);
    expect(JSON.parse(response.text).data.register).toBeTruthy();
    const user = await User.findOne({
      email: "test@test.com"
    });
    expect(user).toMatchObject({
      email: "test@test.com"
    });
  });

  test("Duplicate email id failure", async () => {
    const response = await request
      .post("/")
      .send({
        query: registerMutation
      })
      .expect(200);
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.data.register).toBeNull();
    expect(parsedResponse.errors).toHaveLength(1);
    expect(parsedResponse.errors[0]).toMatchObject({
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
    const response = await request
      .post("/")
      .send({
        query: registerMutation2
      })
      .expect(200);
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.data.register).toBeNull();
    expect(parsedResponse.errors).toHaveLength(1);
    expect(parsedResponse.errors[0]).toMatchObject({
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

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
  });
});
