# Publish Attendance Forecast Task Specification

## Basic Information

- **Task ID:** T10
- **Task name:** Publish attendance forecast
- **Task type:** Act
- **Task owner:** Hackathon organizer

## 1. Task Description

Publish the attendance forecast after the hackathon organizer has explicitly approved it in T9. This task uses rule-based automation to make the approved forecast available to the organizer and record its publication status. The task does not publish a forecast when the organizer review is pending, changes have been requested, or explicit approval has not been recorded.

## 2. Inputs

### Input 1

- **Input name:** Organizer review decision
- **Contents and format:** Human-recorded decision from T9 indicating whether the attendance forecast is approved for publication, along with any requested changes or comments.
- **Source:** T9 Review forecast and recommendations.

### Input 2

- **Input name:** Attendance forecast
- **Contents and format:** Structured forecast containing the predicted number of attendees, forecast confidence, and identified attendance risks.
- **Source:** T6 Predict participant attendance.

- **If a required input is missing or invalid:** Do not publish the attendance forecast. Record the publication task as incomplete and hand the missing or invalid input information to the hackathon organizer. A missing, pending, or non-approved organizer review decision must not be treated as approval.

## 3. Outputs

### Output 1

- **Output name:** Published attendance forecast
- **Contents and format:** Approved attendance forecast containing the predicted number of attendees, forecast confidence, identified attendance risks, and publication status.
- **Next task or recipient:** Hackathon organizer. After publication, the workflow checks whether new registrations have been received. If new registrations are received, the workflow returns to T2 Collect registration data.
- **Complete when:** The approved attendance forecast has been published once, made available to the hackathon organizer, and its publication status has been recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** `publish_attendance_forecast`
- **Input:** Organizer review decision; Attendance forecast
- **Output:** Published attendance forecast
- **Implementation Route:** Database queries and functions/scripts for storing and displaying the approved attendance forecast.
- **Integration approach:** Direct integration.
- **Role in this task:** Verify that explicit organizer approval is present, publish the approved attendance forecast, and record its publication status for the workflow.
- **Task timeout:** 30 seconds for one task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary system or database error prevents publication. Retry once only if it can be confirmed that the first attempt did not successfully publish the forecast. If the outcome of the first attempt is uncertain, do not retry because doing so could create a duplicate publication.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the publication as incomplete and hand the approved forecast, organizer review decision, and error status to the hackathon organizer. Do not mark the forecast as published unless successful publication can be confirmed.
