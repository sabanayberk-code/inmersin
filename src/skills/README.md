# Skills Directory

This directory contains reusable skills (utilities/services) used by Agents.

## Structure
A skill should handle a **Single Responsibility**.

### Example: TranslationSkill
- **Purpose**: Translate text using an external API.
- **Input**: Text, Target Language
- **Output**: Translated Text

## Rules
- Skills should NOT directly access the database (preferred).
- Skills should return typed results (Zod/TS).
