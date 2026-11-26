
import { expect } from "chai";
import request from "supertest";
import express from "express";
import pino from "pino";
import { Writable } from "stream";

import app from "../src/app.js";
import errorHandler, {
  createErrorHandler,
} from "../src/middleware/errorHandler.js";

const errorTestApp = express();

errorTestApp.get("/server-error", () => {
  throw new Error("Database password is secret");
});

errorTestApp.get("/client-error", (req, res, next) => {
  const error = new Error("Invalid request");
  error.statusCode = 400;
  next(error);
});

errorTestApp.use(errorHandler);

describe("Notes API", () => {
  describe("Health Check", () => {
    it("should confirm that the API is working", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Notes API is running");
      expect(response.body.timestamp).to.be.a("string");
    });
  });

  describe("Unknown Routes", () => {
    it("should return an error when a route does not exist", async () => {
      const response = await request(app).get("/api/unknown");

      expect(response.status).to.equal(404);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Route not found: /api/unknown");
    });

    it("should show the requested URL in the error message", async () => {
      const response = await request(app).get("/api/random-page");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.include("/api/random-page");
    });

    it("should return errors in JSON format", async () => {
      const response = await request(app).get("/api/unknown");

      expect(response.headers["content-type"]).to.include("application/json");
    });
  });

  describe("HTTP Methods", () => {
    it("should reject unsupported methods on the health route", async () => {
      const response = await request(app).post("/api/health");

      expect(response.status).to.equal(404);
      expect(response.body.success).to.equal(false);
    });
  });

  describe("Response Format", () => {
    it("should return the health check response in JSON format", async () => {
      const response = await request(app)
        .get("/api/health")
        .set("Accept", "application/json");

      expect(response.status).to.equal(200);
      expect(response.headers["content-type"]).to.include("application/json");
    });
  });

  describe("Error Handler", () => {
    it("should hide internal error details", async () => {
      const response = await request(errorTestApp).get("/server-error");

      expect(response.status).to.equal(500);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Internal server error");
      expect(response.body.message).to.not.include("Database password");
    });

    it("should return the correct message for client errors", async () => {
      const response = await request(errorTestApp).get("/client-error");

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Invalid request");
    });

    it("should not log passwords from malformed JSON requests", async () => {
      let logOutput = "";

      const testLogger = pino(
        { level: "error" },
        new Writable({
          write(chunk, encoding, callback) {
            logOutput += chunk.toString();
            callback();
          },
        })
      );

      const malformedJsonApp = express();

      malformedJsonApp.use(express.json());

      malformedJsonApp.post("/api/auth/login", (req, res) => {
        res.json({ success: true });
      });

      malformedJsonApp.use(createErrorHandler(testLogger));

      const secretPassword = "MyFakeSecretPassword123";

      const response = await request(malformedJsonApp)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send(`{"email":"test@example.com","password":"${secretPassword}"`);

      expect(response.status).to.equal(400);
      expect(logOutput).to.not.include(secretPassword);
    });
  });
});
