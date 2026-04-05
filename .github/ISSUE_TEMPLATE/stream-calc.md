---
title: Stream Calculator: Human-friendly Flow Rate Input
labels: enhancement, frontend, DX
assignees: anmol
---

## Problem

Creating a stream currently requires entering a raw flowRate in internal units (e.g. 1000000000 = 0.001 GROW/sec), which is confusing for users. Real use cases are: "I want to pay someone $500/month" or "I want to stream 10 GROW per day to my team member". There is no way to go from intent to input value easily.

## Solution

Build a Stream Calculator component with:
- Input mode selector: Per Second | Per Day | Per Month
- Amount input (e.g., “10” GROW/day)
- Live preview panel showing:
  - Flow rate in GROW/sec (human-readable)
  - Raw flowRate units (for API)
  - Estimated daily/weekly/monthly outflow
  - Minimum required buffer (with top-up suggestions)
  - Stream duration for a given deposit
- Pass calculated rawFlowRate to the stream creation form
- Keep existing raw-input preset buttons for advanced users
- Export component from SDK for external integrators

## Acceptance Criteria

- User can enter flow rate in GROW/day or GROW/month, not just raw units
- Live preview updates instantly showing minimum buffer and estimated duration
- Calculated flowRate is passed correctly to the stream create API call
- Existing raw-input preset buttons still work for advanced users
- Component exported from SDK for external use

---

Closes #stream-calc
