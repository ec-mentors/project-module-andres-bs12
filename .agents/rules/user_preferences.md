# User Preferences & Workflows

## 1. Code Delivery Rule
- **Do NOT provide raw code snippets unless explicitly requested by the user.**
- The user is in learning mode. Prioritize explaining concepts, architectural design, execution logic, step-by-step roadmaps, and conceptual flows.

## 2. Jira & Documentation Sync Rule
- When the user asks to add tasks to Jira, use the Jira Cloud REST API (using credentials from `.env`) to automatically create the issues/subtasks in Jira (Project Key: `NT`).
- After creating Jira tasks, automatically update and sync the Sprint Backlog tables in [`README.md`](file:///Users/andresbejarano/dev/NutritionTracker/README.md).
