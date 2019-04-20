import { Router } from "express";
import { User } from "../entity/User";
import redis from "../redis";

const router = Router();

router.get("/confirm/:id", async (request, response) => {
  const id = request.params.id;
  const userId = await redis.get(id);
  if (userId) {
    await User.update({ id: userId }, { confirmed: true });
    await redis.del(id);
    response.send("ok");
  } else {
    response.send("invalid/expired link");
  }
});

export default router;
