
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import User from "../src/models/User.js";

let mongoServer;

process.env.JWT_SECRET = "test_secret_for_authentication_only";
process.env.JWT_EXPIRES_IN = "1d";

before(async function () {
    this.timeout(120000);

    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
});

after(async function () {
    this.timeout(120000);

    let disconnectError;

    try {
        await mongoose.disconnect();
    } catch (error) {
        disconnectError = error;
    }

    try {
        if (mongoServer) {
            await mongoServer.stop();
        }
    } catch (error) {
        if (!disconnectError) {
            throw error;
        }
    }

    if (disconnectError) {
        throw disconnectError;
    }
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe("Authentication API", () => {
    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Muhammad Noor",
                    email: "noor@example.com",
                    password: "Password123",
                });

            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.user.email).to.equal("noor@example.com");
            expect(response.body.data.user.name).to.equal("Muhammad Noor");
            expect(response.body.data.token).to.be.a("string");
            expect(response.body.data.user.password).to.be.undefined;
        });

        it("should reject an already registered email", async () => {
            await User.create({
                name: "Muhammad Noor",
                email: "noor@example.com",
                password: "hashed_password",
            });

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Another User",
                    email: "noor@example.com",
                    password: "Password123",
                });

            expect(response.status).to.equal(409);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Email is already registered");
        });

        it("should reject invalid registration data", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "No",
                    email: "invalid-email",
                    password: "123",
                });

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });

        it("should accept a password of exactly 72 UTF-8 bytes", async () => {
            const password = "A".repeat(72);

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Muhammad Noor",
                    email: "noor72@example.com",
                    password,
                });

            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
        });

        it("should reject a password exceeding 72 UTF-8 bytes", async () => {
            const password = "A".repeat(73);

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Muhammad Noor",
                    email: "noor73@example.com",
                    password,
                });

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });

        it("should reject additional fields", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Muhammad Noor",
                    email: "noor@example.com",
                    password: "Password123",
                    role: "admin",
                });

            expect(response.status).to.equal(400);
        });
    });

    describe("POST /api/auth/login", () => {
        beforeEach(async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Muhammad Noor",
                    email: "noor@example.com",
                    password: "Password123",
                });

            expect(response.status).to.equal(201);
        });

        it("should log in with valid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "noor@example.com",
                    password: "Password123",
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.token).to.be.a("string");
            expect(response.body.data.user.email).to.equal("noor@example.com");
        });

        it("should reject an incorrect password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "noor@example.com",
                    password: "WrongPassword123",
                });

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Invalid email or password");
        });

        it("should reject an unregistered email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "unknown@example.com",
                    password: "Password123",
                });

            expect(response.status).to.equal(401);
            expect(response.body.message).to.equal("Invalid email or password");
        });
    });

    describe("GET /api/auth/me", () => {
        let token;

        beforeEach(async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Muhammad Noor",
                    email: "noor@example.com",
                    password: "Password123",
                });

            token = response.body.data.token;
        });

        it("should return the current authenticated user", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.user.email).to.equal("noor@example.com");
            expect(response.body.data.user.name).to.equal("Muhammad Noor");
        });

        it("should reject requests without an authorization token", async () => {
            const response = await request(app).get("/api/auth/me");

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Authentication required");
        });

        it("should reject an invalid token", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid.token.value");

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Invalid or expired token");
        });
    });
});
