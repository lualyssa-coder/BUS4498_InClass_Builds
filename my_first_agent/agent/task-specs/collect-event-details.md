# Collect Event Details Task Specification

## Basic Information

- **Task ID:** T1
- **Task name:** Collect event details
- **Task type:** Retrieve
- **Task owner:** Hackathon organizer

## 1. Task Description

Collect the event information required for HackTrack to process registrations and support attendance planning. The task uses predefined required fields to capture the event date, format, location, capacity, and registration status. Required-field rules are used to ensure the necessary event information is provided before the workflow continues.

## 2. Inputs

### Input 1

- **Input name:** Event information
- **Contents and format:** Structured form containing the event date, format, location, capacity, and registration status.
- **Source:** Hackathon organizer.

- **If a required input is missing or invalid:** Mark the event information as incomplete and return it to the hackathon organizer for correction. Do not continue the task as if the required information was provided.

## 3. Outputs

### Output 1

- **Output name:** Event details
- **Contents and format:** Structured event record containing the validated event date, format, location, capacity, and registration status.
- **Next task or recipient:** T2 Collect registration data. Event details are also available as an input to T8 Recommend organizer actions.
- **Complete when:** All required event fields are present and the event details have been stored in a structured record that can be used by downstream tasks.

## 4. Planned Tools

### Tool 1

- **Tool name:** `collect_event_details`
- **Input:** Event information
- **Output:** Event details
- **Implementation Route:** Database queries and functions/scripts for storing and checking required event fields.
- **Integration approach:** Direct integration.
- **Role in this task:** Capture the event information submitted by the hackathon organizer, check that required fields are present, and store the information as the Event details output.
- **Task timeout:** 30 seconds for one task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary system or database error prevents the event details from being stored. Retry once only if the first attempt did not create the event record, so a duplicate record is not created. If the outcome of the first attempt is uncertain, do not retry and hand the case to the hackathon organizer.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the task as incomplete and hand the event information and error status to the hackathon organizer. Do not continue to T2 as if the event details were successfully collected.
