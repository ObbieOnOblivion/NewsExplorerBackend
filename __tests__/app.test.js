const request = require('supertest');
const app = require('../src/app.js');

// this is fascinating for me but i think im getting off track, need to finish!
describe("different app requests", () => {

    describe("Security Middleware", () => {
        test("should block SQLi attempts", async () => {
          const res = await request(app)
            .post('/api/users')
            .send({ 
              email: `valid@test.com' OR '1'='1';--`, 
              name: "<script>alert('XSS')</script>"
            });
          
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toMatch(/sanitized/i);
        });
      
        test("should reject oversized payloads", async () => {
          const oversizeName = 'a'.repeat(10001); // Exceeds typical 10kb limit
          const res = await request(app)
            .post('/api/users')
            .send({ email: 'valid@test.com', name: oversizeName });
          
          expect(res.statusCode).toBe(413);
        });
      });

    describe("POST", () => {
        test(" api/users/me ", async () => {
            try {
                const response = await request(app)
                    .post('/api/users')
                    .send({ name: 'John', email: 'john@test.com' });

                expect(response.statusCode).toBe(201);
                expect(response.body).toHaveProperty('id');
            } catch (err) {
                throw err;
            }
        });

        test("should reject duplicate emails", async () => {
            await request(app).post('/api/users').send({ email: 'dupe@test.com' });

            // Test duplicate case
            await expect(
                request(app).post('/api/users').send({ email: 'dupe@test.com' })
            ).rejects.toThrow(); // or .resolves for successful cases
        });

        const testCases = [
            // Invalid emails
            { input: 'plainstring', expected: 400 },
            { input: 'missing@domain', expected: 400 },
            { input: 'xss<script>alert(1)</script>@test.com', expected: 400 },

            // Valid but edge cases
            { input: 'a@b.cd', expected: 201 }, // Minimal valid email
            { input: 'user+filter@example.com', expected: 201 }, // With sub-addressing
        ];

        testCases.forEach(({ input, expected }) => {
            test(`responds ${expected} for "${input}"`, async () => {
                const res = await request(app)
                    .post('/api/users')
                    .send({ email: input });
                expect(res.statusCode).toBe(expected);
            });
        });
    })
})