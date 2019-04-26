import server from "../server";
import { formatError } from "../utils/errorFormatter";
import supertest = require("supertest");
const app = server.createHttpServer({ formatError });
const request = supertest(app);

test("confirmation failure due to wrong link", async () => {
  const response = await request.get("/confirm/234dfsdf343423").expect(200);
  expect(response.text).toEqual("invalid/expired link");
});
