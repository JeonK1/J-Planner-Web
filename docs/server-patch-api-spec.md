# PATCH /plans/{accessCode} API Specification

## Overview

Batch update endpoint for saving multiple plan changes in a single request.
Replaces individual PUT calls for plan info and each section.

## Endpoint

```
PATCH /plans/{accessCode}
```

## Authentication

- **Header**: `Authorization: Bearer {token}`
- Token obtained via `POST /plans/{accessCode}/auth`

## Request

### Content-Type

`application/json`

### Body

All fields are optional. Only include fields that have changed.

```json
{
  "plan": {
    "title": "string",
    "description": "string",
    "startDate": "string (YYYY-MM-DD)",
    "endDate": "string (YYYY-MM-DD)"
  },
  "sections": [
    {
      "id": 1,
      "title": "string",
      "confirmed": true,
      "flightInfo": {
        "tripType": "ONE_WAY | ROUND_TRIP",
        "legs": [
          {
            "legOrder": 0,
            "airline": "string",
            "flightNumber": "string",
            "departureAirport": "string",
            "arrivalAirport": "string",
            "departureTime": "string (ISO 8601) | null",
            "arrivalTime": "string (ISO 8601) | null",
            "bookingReference": "string | null",
            "notes": "string | null"
          }
        ],
        "price": "number | null"
      },
      "accommodationInfo": {
        "name": "string",
        "address": "string",
        "checkIn": "string (ISO 8601) | null",
        "checkOut": "string (ISO 8601) | null",
        "bookingReference": "string | null",
        "contactNumber": "string | null",
        "notes": "string | null",
        "price": "number | null"
      },
      "activityInfo": {
        "name": "string",
        "location": "string | null",
        "startTime": "string (ISO 8601) | null",
        "endTime": "string (ISO 8601) | null",
        "price": "number | null",
        "notes": "string | null"
      }
    }
  ]
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plan` | object | No | Plan metadata changes. Omit if unchanged. |
| `plan.title` | string | No | Plan title (max 100 chars) |
| `plan.description` | string | No | Plan description (max 100 chars) |
| `plan.startDate` | string | No | Start date (YYYY-MM-DD) |
| `plan.endDate` | string | No | End date (YYYY-MM-DD, >= startDate) |
| `sections` | array | No | Changed sections only. Omit or empty array if unchanged. |
| `sections[].id` | number | **Yes** | Section ID (must belong to this plan) |
| `sections[].title` | string | No | Section title (max 200 chars) |
| `sections[].confirmed` | boolean | No | Confirmation status |
| `sections[].flightInfo` | object | No | Flight data (only for flight sections) |
| `sections[].accommodationInfo` | object | No | Accommodation data (only for accommodation sections) |
| `sections[].activityInfo` | object | No | Activity data (only for activity sections) |

## Response

### 200 OK

Returns the full updated plan (same schema as `GET /plans/{accessCode}`).

```json
{
  "accessCode": "abc123",
  "title": "Updated Title",
  "description": "...",
  "startDate": "2024-07-01",
  "endDate": "2024-07-10",
  "sections": [ ... ],
  "createdAt": "2024-06-01T00:00:00Z",
  "updatedAt": "2024-06-15T12:00:00Z"
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_INPUT` | Validation error (e.g., title too long, invalid date range) |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `SESSION_EXPIRED` | Token expired |
| 404 | `PLAN_NOT_FOUND` | Plan with given accessCode not found |
| 404 | `SECTION_NOT_FOUND` | Section ID does not belong to this plan |
| 429 | `TOO_MANY_REQUESTS` | Rate limited (includes `Retry-After` header) |

## Transaction Requirements

- All changes (plan + sections) MUST be applied atomically within a single transaction.
- If any section update fails validation, the entire request should be rolled back.
- The response should reflect the state after all changes are applied.

## Implementation Notes

- Only process fields that are present in the request body.
- Validate section IDs belong to the specified plan before applying changes.
- `flightInfo`, `accommodationInfo`, and `activityInfo` follow the same schema as the existing `PUT /plans/{accessCode}/sections/{sectionId}` endpoint.
- The `displayOrder` of sections is NOT affected by this endpoint (use the existing reorder endpoint).
