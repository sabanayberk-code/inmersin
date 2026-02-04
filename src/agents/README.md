# Agents Directory

This directory contains the business logic agents for the application.

## Structure
Each agent should follow the **Input -> Process -> Output** pattern.

### Example: PropertyListingAgent
- **Input**: Raw property data (JSON)
- **Process**: 
    1. Validation (Zod)
    2. Sanitization (HTML)
    3. Enrichment (Skills: Translation, Image Opt)
- **Output**: Database Record ID

## Rules
- Agents should be stateless where possible.
- Use `src/lib/db.ts` for data access.
- Use `src/skills` for reusable sub-tasks.
