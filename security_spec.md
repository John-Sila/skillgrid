# Firestore Security Specification

## Data Invariants
1. A **User** profile can only be created by the authenticated user it belongs to.
2. A **Booking** must have a valid `providerId` and `clientId`.
3. A **Booking** can only be created by the `clientId` (the user making the booking).
4. Only the `providerId` or `clientId` can read a **Booking**.
5. Only the `providerId` can update a **Booking**'s status to 'confirmed' or 'completed'.
6. A **BlockedDate** can only be created/deleted by the provider it belongs to.

## The "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Spoofing**: Creating a user profile with a UID that doesn't match `request.auth.uid`.
2. **Role Escalation**: A client trying to update their own `flaggedCount` or `reliability`.
3. **Ghost Booking**: Creating a booking with a `clientId` that is not the requester.
4. **Price Manipulation**: A client updating the `price` of an existing booking.
5. **Unauthorized Status Change**: A client trying to mark a booking as 'completed'.
6. **Availability Hijacking**: A user blocking a date for a provider they don't own.
7. **Cross-User Leak**: A user trying to list bookings belonging to another user.
8. **Shadow Fields**: Creating a booking with additional unvalidated keys like `isSystemAdmin: true`.
9. **Orphaned Writes**: Creating a booking with a non-existent `providerId`.
10. **Timestamp Fraud**: Setting a `createdAt` date in the past during creation.
11. **PII Scraping**: Trying to list all user profiles without filtering by UID.
12. **Status Skipping**: Moving a booking from 'pending' to 'completed' without the 'confirmed' step (if applicable).

## Test Runner Logic
The `firestore.rules.test.ts` (conceptual) would iterate through these payloads and assert `PERMISSION_DENIED`.
