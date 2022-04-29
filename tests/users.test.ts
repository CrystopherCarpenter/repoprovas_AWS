import supertest from "supertest";
import app from "../src/app";
import { prisma } from "../src/database.js";
import userBodyFactory from "./factories/userBodyFactory";
import userFactory from "./factories/userFactory";

describe("User tests - POST /sign-up", () => {
  beforeEach(truncateUsers);

  afterAll(disconnect);

  it("should return 201 and persist the user given a valid body", async () => {
    const body = userBodyFactory();

    const response = await supertest(app).post("/sign-up").send(body);
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    expect(response.status).toEqual(201);
    expect(user).not.toBeNull();
  });

  it("should return 422 given a invalid body", async () => {
    const body = {};

    const response = await supertest(app).post("/sign-up").send(body);

    expect(response.status).toEqual(422);
  });

  it("should return 409 given a duplicate email", async () => {
    const body = userBodyFactory();

    await supertest(app).post("/sign-up").send(body);
    const response = await supertest(app).post("/sign-up").send(body);
    const users = await prisma.user.findMany({
      where: {
        email: body.email,
      },
    });

    expect(response.status).toEqual(409);
    expect(users.length).toEqual(1);
  });
});

describe("User tests - POST /sign-in", () => {
  beforeEach(truncateUsers);

  afterAll(disconnect);

  it("should return 200 and a token given valid credentials", async () => {
    const body = userBodyFactory();
    await userFactory(body);

    const response = await supertest(app).post("/sign-in").send(body);

    expect(response.status).toEqual(200);
    expect(typeof response.body.token).toEqual("string");
    expect(response.body.token.length).toBeGreaterThan(0);
  });

  it("should return 401 given invalid email", async () => {
    const body = userBodyFactory();

    const response = await supertest(app).post("/sign-in").send(body);

    expect(response.status).toEqual(401);
  });

  it("should return 401 given invalid password", async () => {
    const body = userBodyFactory();
    await userFactory(body);

    const response = await supertest(app)
      .post("/sign-in")
      .send({
        ...body,
        password: "bananinha",
      });

    expect(response.status).toEqual(401);
  });
});

async function disconnect() {
  await prisma.$disconnect();
}

async function truncateUsers() {
  await prisma.$executeRaw`TRUNCATE TABLE users;`;
}
