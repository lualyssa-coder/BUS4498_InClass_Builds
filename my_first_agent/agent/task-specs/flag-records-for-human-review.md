# Flag Records for Human Review Task Specification

## Basic Information

- **Task ID:** T4
- **Task name:** Flag records for human review
- **Task type:** Act
- **Task owner:** Hackathon organizer

## 1. Task Description

Flag registration records that fail the validation checks in T3 so the hackathon organizer can review them. This task uses predefined rules to route records with identified validation issues to the organizer rather than attempting to resolve the issues automatically. The organizer can then correct or address the flagged information before the record is returned to the registration process.

## 2. Inputs

### Input 1

- **Input name:** Registration validation issues
- **Contents and format:** Structured list of registration records that failed one or more validation checks, including the record identifier and reason each record was flagged.
- **Source:** T3 Validate registration records.
- **If a required input is missing or invalid:** Record the routing task as incomplete and notify the hackathon organizer of the missing or invalid validation information. Do not treat the affected record as reviewed or corrected.

## 3. Outputs

### Output 1

- **Output name:** Human review flag
- **Contents and format:** Structured review record containing the affected registration record identifier, the validation issue, and a status indicating that human review is required.
- **Next task or recipient:** Hackathon organizer. After the organizer reviews and corrects the flagged information, the corrected registration information returns to T2 Collect registration data.
- **Complete when:** The affected registration record has been marked for human review and made available to the hackathon organizer with the reason it was flagged.

## 4. Planned Tools

### Tool 1

- **Tool name:** `flag_records_for_human_review`
- **Input:** Registration validation issues
- **Output:** Human review flag
- **Implementation Route:** Database queries and functions/scripts for updating the review status of flagged registration records.
- **Integration approach:** Direct integration.
- **Role in this task:** Apply a human-review status to records that failed validation and make the flagged records and their validation issues available to the hackathon organizer.
- **Task timeout:** 30 seconds for one task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary system or database error prevents the human-review flag from being recorded. Retry once only if it can be confirmed that the first attempt did not successfully create the flag. If the outcome of the first attempt is uncertain, do not retry because doing so could create a duplicate review record.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the routing attempt as incomplete and hand the affected registration record, validation issue, and error status to the hackathon organizer. Do not treat the record as successfully flagged for review.
