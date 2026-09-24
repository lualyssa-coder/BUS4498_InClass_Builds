# Collect Registration Data Task Specification

## Basic Information

- **Task ID:** T2
- **Task name:** Collect registration data
- **Task type:** Retrieve
- **Task owner:** Hackathon organizer

## 1. Task Description

Collect the participant registration information needed for HackTrack to validate registrations and support attendance forecasting. The task uses predefined required fields to capture registration information and confirmation status. Required-field rules are used to ensure the necessary registration information is available before the workflow continues.

## 2. Inputs

### Input 1

- **Input name:** Event details
- **Contents and format:** Structured event record containing the event date, format, location, capacity, and registration status.
- **Source:** T1 Collect event details.

### Input 2

- **Input name:** Participant registration submissions
- **Contents and format:** Structured registration records containing registration date, participant background information collected by the event, and registration confirmation status.
- **Source:** Participants through the hackathon registration process.

- **If a required input is missing or invalid:** Mark the affected registration information as incomplete and route the record to T4 Flag records for human review. Do not continue processing the affected record as if the required information were valid.

## 3. Outputs

### Output 1

- **Output name:** Registration data
- **Contents and format:** Structured collection of participant registration records containing the information required for validation and attendance analysis.
- **Next task or recipient:** T3 Validate registration records.
- **Complete when:** Available registration submissions have been collected into structured records and are ready for validation.

### Output 2

- **Output name:** Registration confirmation status
- **Contents and format:** Structured summary containing the total number of registered participants, number and proportion confirmed, and number and proportion unconfirmed.
- **Next task or recipient:** T8 Recommend organizer actions.
- **Complete when:** Confirmation status has been summarized from the available registration records and is ready for use by T8.

## 4. Planned Tools

### Tool 1

- **Tool name:** `collect_registration_data`
- **Input:** Event details; Participant registration submissions
- **Output:** Registration data; Registration confirmation status
- **Implementation Route:** Database queries and functions/scripts for retrieving and organizing registration records.
- **Integration approach:** Direct integration.
- **Role in this task:** Retrieve participant registration submissions associated with the event, organize them into structured registration records, and summarize registration confirmation status for downstream tasks.
- **Task timeout:** 30 seconds for one task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary database or system-access error prevents registration data from being retrieved. Retry once only if the first attempt did not change or duplicate any registration records. If the outcome of the first attempt is uncertain, do not retry and hand the case to the hackathon organizer.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the task as incomplete and hand the affected registration information and error status to the hackathon organizer. Do not continue to T3 as if the registration data were successfully collected.
