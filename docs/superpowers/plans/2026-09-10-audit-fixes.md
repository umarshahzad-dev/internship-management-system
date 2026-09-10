# IMAS audit fixes

## Scope

Harden backend authorization, uploads, storage, pagination, indexing, outbox processing, and seed safety; complete the announcements/admin/SGK/catalog frontend workflows; and remove permission, profile, shell, evaluation, and URL-state gaps without changing the business architecture.

## Execution order

1. Backend security invariants and authorization boundaries.
2. Backend projections, pagination, indexes, storage and worker scalability.
3. Frontend shared capability map, announcements, admin summary/user editing, SGK and catalogs.
4. Frontend workflow polish (profile, shell, evaluation signing, final grade, student operations) and list state.
5. Targeted tests first for each changed boundary, then Docker lint/build/test verification for both services.

## Constraints

- Work only in this worktree.
- Preserve pure domain entities and use-case architecture.
- Keep role permissions identical in frontend and backend.
- Preserve the institutional OBIS/LMS visual language.
- Do not copy code or files from IMAS-gemini-test.
