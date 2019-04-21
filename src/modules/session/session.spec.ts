import server from "../../server";
import { formatError } from "../../utils/errorFormatter";
import supertest = require("supertest");
import createtypeORMConnection from "../../utils/typeORMConnection";
import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { GenericError } from "../../errors/genericError";
import constants from "../../constants";

const app = server.createHttpServer({ formatError });
const request = supertest(app);
const agent = supertest.agent(app);

let connection: Connection;
const loginMutationGenerator = (email: string, password: string) => {
  return {
    query: `
    mutation{
      login(email:"${email}",password:"${password}")
    }
  `
  };
};

const meQuery = {
  query: `
  {
    me{
      id
      email
      name
    }
  }
  `
};

const logoutMutation = {
  query: `
  mutation{
    logout
  }
  `
};

const user = {
  email: "testuser@test.com",
  name: "test",
  password: "password1"
};

const confirmedUser = {
  email: "testuser2@test.com",
  name: "test2",
  password: "password5",
  confirmed: true
};

beforeAll(async () => {
  connection = await createtypeORMConnection();
  await User.create(user).save();
  await User.create(confirmedUser).save();
});

afterAll(async () => {
  if (connection) {
    await connection.close();
  }
});

const loginQuery = async (request: any, email: string, password: string) => {
  const response = await request
    .post("/")
    .send(loginMutationGenerator(email, password))
    .expect(200);
  return JSON.parse(response.text);
};

const meQueryRequest = async (request: any) => {
  const response = await request
    .post("/")
    .send(meQuery)
    .expect(200);
  return JSON.parse(response.text);
};

const logoutMutationRequest = async (request: any) => {
  const response = await request
    .post("/")
    .send(logoutMutation)
    .expect(200);
  return JSON.parse(response.text);
};

describe("login tests", () => {
  test("Invalid login due to wrong email id", async () => {
    const response = await loginQuery(request, "test2@dfd.com", user.password);
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
    const response = await loginQuery(request, user.email, user.password);
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

  test("Success login for verified user", async () => {
    let response = await loginQuery(
      agent,
      confirmedUser.email,
      confirmedUser.password
    );
    expect(response.data).not.toBeNull();
    expect(response.data.login).toBeTruthy();

    response = await meQueryRequest(agent);
    expect(response.data).not.toBeNull();
    expect(response.data.me.email).toBe(confirmedUser.email);
    await logoutMutationRequest(agent);
  });

  test("anonymous user response for non logged in user", async () => {
    const response = await meQueryRequest(request);
    expect(response.data).not.toBeNull();
    expect(response.data.me.name).toBe("anonymous");
  });
});

describe("logout tests", () => {
  test("logout logged in user", async () => {
    let response = await loginQuery(
      agent,
      confirmedUser.email,
      confirmedUser.password
    );
    expect(response.data).not.toBeNull();
    expect(response.data.login).toBeTruthy();
    response = await logoutMutationRequest(agent);
    expect(response.data.logout).toBeTruthy();
    response = await meQueryRequest(agent);
    expect(response.data).not.toBeNull();
    expect(response.data.me.name).toBe("anonymous");
  });

  test("try to logout anonymous user", async () => {
    let response = await logoutMutationRequest(request);
    expect(response.data.logout).toBeTruthy();
  });
});
