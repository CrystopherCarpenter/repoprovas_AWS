import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import { CreateUserData } from "../../src/services/userService";

describe("Integration Tests", () => {
  describe("POST /sign-up", () => {
    it("should persist the user given a valid body", async () => {
      const user: CreateUserData = {
        email: "dina233@email.com",
        password: "123",
      };

      const response = await supertest(app).post("/sign-up").send(user);
      const createdUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      expect(response.status).toEqual(201);
      expect(createdUser).not.toBeNull();
    });
  });
});
