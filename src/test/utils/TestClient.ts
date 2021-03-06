import server from "../../server";
import { formatError } from "../../utils/errorFormatter";
import supertest = require("supertest");
const app = server.createHttpServer({ formatError });

export class TestClient {
  url: string;
  request: supertest.SuperTest<supertest.Test>;
  constructor(url = "/") {
    this.url = url;
    this.request = supertest.agent(app);
  }

  fire(query: string) {
    return this.request
      .post(this.url)
      .accept("application/json")
      .send({
        query
      });
  }

  login(email: string, password: string) {
    return this.fire(`
    mutation{
      login(email:"${email}",password:"${password}")
    }
  `);
  }

  me() {
    return this.fire(`
    { me {
        id
        email
        name
      }
    }
  `);
  }

  logout() {
    return this.fire(`
    mutation{
      logout
    }
    `);
  }

  register(email: string, password: string, name: string) {
    return this.fire(`
    mutation {
      register(email:"${email}",password:"${password}",name:"${name}")
    }
    `);
  }

  get(url: string) {
    return this.request
      .get(url)
      .accept("application/json")
      .send();
  }

  forgotPasswordChange(password: string, id: string) {
    return this.fire(`
      mutation {
        forgotPasswordChange(password:"${password}",id:"${id}")
      }
    `);
  }

  sendForgotPasswordLink() {
    return this.fire(`
      mutation {
        sendForgotPasswordEmailLink
      }
    `);
  }
}
