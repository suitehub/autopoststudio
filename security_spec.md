# Firebase Security Specification

## Data Invariants
1. A Template must be owned by the user who created it (`ownerId == request.auth.uid`).
2. A Template's slide list and element lists must not exceed safe bounds (e.g. up to 10 slides, elements are well-formed).
3. A HistoryItem must be owned by the user who generated it (`ownerId == request.auth.uid`).
4. Timestamps should match creation dates.
5. Users can only read and write their own documents.

## Dirty Dozen Payloads (Targeting security vulnerabilities)
1. Write a Template with no `ownerId` (should be rejected).
2. Write a Template with someone else's `ownerId` (should be rejected).
3. Read a Template belonging to a different user (should be rejected).
4. List Templates without query filtering on `ownerId` (should be rejected).
5. Write a Template with an invalid name size exceeding 100 characters (should be rejected).
6. Write a HistoryItem with someone else's `ownerId` (should be rejected).
7. Read a HistoryItem belonging to another user (should be rejected).
8. Write a HistoryItem with non-string `projectName` (should be rejected).
9. Update a Template's immutable fields such as `ownerId` or `createdAt` (should be rejected).
10. Attempt to read list of `history` as unauthenticated user (should be rejected).
11. Inject malicious HTML/JS characters into Template `id` (should be rejected by `isValidId`).
12. Attempt to create a document with empty keys or shadow fields (should be rejected by `keys().size()` checks).
