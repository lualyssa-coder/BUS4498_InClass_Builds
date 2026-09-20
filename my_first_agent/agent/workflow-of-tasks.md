# Workflow of Tasks

## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

The workflow starts when a hackathon organizer creates an event and opens registration, or when new registration information is submitted.

### 1.3 Completion Condition at Runtime

The workflow is complete when HackTrack has produced an attendance forecast, identified registration trends or risks, and provided recommended actions for human review.

### 1.4 General Workflow

HackTrack begins by collecting hackathon details and participant registration information, such as the event date, location, capacity, registration date, participant background, and registration status. The system validates the registration data and checks for missing, duplicate, or inaccurate entries. If information is incomplete or conflicts with existing records, HackTrack flags it for human review instead of making assumptions.

Once the data is validated, HackTrack analyzes registration patterns to estimate how many registered participants are likely to attend. The forecast may consider factors such as registration timing, confirmation status, previous event attendance, event format, and cancellation history when available. HackTrack then compares the predicted attendance with the event’s capacity and planning requirements. If the prediction shows risks, such as low attendance, likely overcrowding, or a high number of unconfirmed registrants, it recommends actions such as sending reminders, opening a waitlist, adjusting food orders, or increasing outreach.

Finally, the organizer reviews the forecast and recommendations. After review, HackTrack publishes the attendance forecast. If new registration information is received, the workflow repeats the registration analysis and updates the forecast; otherwise, the attendance forecast is complete.

### 1.5 Workflow Diagram

```mermaid
flowchart TD
    T1["T1: Collect event details"] --> T2["T2: Collect registration data"]
    T2 --> T3["T3: Validate registration records"]
    T3 --> D1{"D1: Is registration data complete and valid?"}
    D1 -->|No| T4["T4: Flag records for human review"]
    T4 --> T2

    D1 -->|Yes| T5["T5: Analyze registration patterns"]
    T5 --> T6["T6: Predict participant attendance"]
    T6 --> T7["T7: Compare forecast with event capacity"]
    T7 --> D2{"D2: Is there an attendance risk?"}

    D2 -->|Yes| T8["T8: Recommend organizer actions"]
    T8 --> T9["T9: Review recommendations"]
    T9 --> T10["T10: Publish attendance forecast"]

    D2 -->|No| T10

    T10 --> D3{"D3: Are new registrations received?"}
    D3 -->|Yes| T2
    D3 -->|No| C1([C1: Attendance forecast complete])
