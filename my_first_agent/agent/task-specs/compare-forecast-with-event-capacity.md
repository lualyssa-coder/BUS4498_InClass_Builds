# Compare Forecast with Event Capacity Task Specification

## Basic Information

- **Task ID:** T7
- **Task name:** Compare forecast with event capacity
- **Task type:** Verify
- **Task owner:** Hackathon organizer

## 1. Task Description

Compare the attendance forecast produced in T6 with the hackathon's event capacity and predefined planning thresholds. This task uses rule-based comparisons to determine whether the predicted attendance creates an attendance risk. The resulting capacity comparison provides structured information that can be used to determine whether organizer actions should be recommended.

## 2. Inputs

### Input 1

- **Input name:** Attendance forecast
- **Contents and format:** Structured forecast containing the predicted number of attendees, forecast confidence, and identified attendance risks.
- **Source:** T6 Predict participant attendance.

### Input 2

- **Input name:** Event details
- **Contents and format:** Structured event record containing the event date, format, location, capacity, and registration status.
- **Source:** T1 Collect event details.

- **If a required input is missing or invalid:** Do not perform the capacity comparison. Record the task as incomplete and hand the missing or invalid input information to the hackathon organizer. Do not classify the event as having or not having an attendance risk.

## 3. Outputs

### Output 1

- **Output name:** Capacity comparison
- **Contents and format:** Structured comparison containing the event capacity, forecasted attendance, difference between forecasted attendance and capacity, and whether predefined planning thresholds indicate an attendance risk.
- **Next task or recipient:** T8 Recommend organizer actions when an attendance risk is identified. When no attendance risk is identified, the workflow proceeds directly to T9 Review forecast and recommendations without additional input from this task.
- **Complete when:** The attendance forecast has been compared with event capacity and the applicable planning thresholds, and the attendance-risk result has been recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** `compare_forecast_with_event_capacity`
- **Input:** Attendance forecast; Event details
- **Output:** Capacity comparison
- **Implementation Route:** Functions/scripts for applying predefined capacity and planning-threshold rules.
- **Integration approach:** Direct integration.
- **Role in this task:** Compare predicted attendance with event capacity and predefined planning thresholds to determine whether an attendance risk is present.
- **Task timeout:** 30 seconds for one task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary processing or system error prevents the comparison from completing. Retry once only if the first attempt did not produce a complete capacity comparison. If the outcome of the first attempt is uncertain, do not treat the comparison as successfully completed.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the comparison as incomplete and hand the attendance forecast, event details, and error status to the hackathon organizer. Do not continue to T8 or T9 as if the attendance-risk result were successfully determined.
