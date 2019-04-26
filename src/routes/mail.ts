import { Router } from "express";
import redis from "../redis";
import { prisma } from "../../config/prisma/prisma-client";

const router = Router();

router.get("/confirm/:id", async (request, response) => {
  const id = request.params.id;
  const userId = await redis.get(id);
  if (userId) {
    await prisma.updateUser({
      where: { id: userId },
      data: { confirmed: true }
    });
    await redis.del(id);
    response.send("ok");
  } else {
    response.send("invalid/expired link");
  }
});

export default router;
