import type { CredentialPayload } from "@/lib/contract";

const SUMMARY =
  "This sample candidate has three skills verified by approved projects: JavaScript and TypeScript basics, HTTP and REST, and Node.js and Express. Each was checked against a rubric, and the repo and commit behind every score are listed below.";

export function demoCredential(
  id: string
): { payload: CredentialPayload; summary: string; revoked: boolean } | null {
  if (id !== "demo-001" && id !== "demo-revoked") return null;

  const payload: CredentialPayload = {
    id,
    candidateName: "Demo Student (sample data)",
    university: "Sample University",
    department: "Computer Science",
    roleTitle: "Backend Engineer",
    issuedAt: "2026-10-30T12:00:00Z",
    skills: [
      {
        skillId: "js-ts-basics",
        skillName: "JavaScript and TypeScript basics",
        taskTitle: "Expense tracker CLI",
        repoUrl: "https://github.com/example/expense-tracker",
        commitHash: "a1b2c3d",
        overall: 88,
        scores: {
          "Runs without errors": 92,
          "Uses TypeScript types properly": 85,
          "Clear README with run steps": 87,
        },
        certificate: null,
      },
      {
        skillId: "http-rest",
        skillName: "HTTP and REST",
        taskTitle: "Tiny HTTP server",
        repoUrl: "https://github.com/example/tiny-http-server",
        commitHash: "e4f5a6b",
        overall: 84,
        scores: {
          "Correct status codes": 86,
          "Returns valid JSON": 90,
          "Clear README listing the routes": 76,
        },
        certificate: null,
      },
      {
        skillId: "node-express",
        skillName: "Node.js and Express",
        taskTitle: "Notes API",
        repoUrl: "https://github.com/example/notes-api",
        commitHash: "c7d8e9f",
        overall: 84,
        scores: {
          "All routes work": 88,
          "Sensible error handling": 80,
          "Clear README with example requests": 84,
        },
        certificate: null,
      },
    ],
  };

  return { payload, summary: SUMMARY, revoked: id === "demo-revoked" };
}