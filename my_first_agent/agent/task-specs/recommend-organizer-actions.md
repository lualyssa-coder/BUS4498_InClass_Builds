# Recommend Organizer Actions Task Specification

```yaml
# BASIC INFORMATION
task_id: "T8"
task_name: "Recommend organizer actions"
task_owner: "Hackathon organizer"

# Agent Inference Configuration
Provider: Groq
Model: "openai/gpt-oss-120b"
Role: Assess attendance risks, generate organizer recommendations, and explain the rationale for each recommendation using the supplied task inputs.
Maximum inference requests per task run: 6
On inference failure or exhausted limits: Record the unresolved status and hand the case to the hackathon organizer.
```

## 1. Task Goal

- **Objective:** Recommend safe, practical actions that help the hackathon organizer respond to predicted attendance risks, such as low attendance, overcrowding, or many unconfirmed registrants. The task produces recommendations for human review; it does not make or send final event changes independently.


## 2. Inbound Inputs

### Input 1

- **Input name:** Attendance forecast
- **What it contains:** Predicted number of attendees, forecast confidence, and identified attendance risks
- **Source:** T6 Predict participant attendance.

### Input 2
- **Input name:** Capacity comparison
- **What it contains:** Event capacity, forecasted attendance, and any threshold or capacity risk.
- **Source:** T7 Compare forecast with event capacity.

### Input 3
- **Input name:** Event details
- **What it contains:** Event date, format, location, registration status, and planning constraints.
- **Source:** T1 Collect event details.

### Input 4

- **Input name:** Registration confirmation status
- **What it contains:** Total registered participants, number and proportion confirmed, and number and proportion unconfirmed.
- **Source:** T2 Collect registration data.
  
## 3. Tool Permissions and Boundaries
*Name each planned tool and specify its permitted use. Use verb-object names, such as **`retrieve_records`**, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

### Task-Wide Limits
- **Total task timeout:** 120 seconds for one task run, including tool calls, retries, reasoning, and waiting. A tool call or retry does not restart this clock.
- **Maximum tool calls:** 6 calls across all tools during one task run; retries count toward this total.

Tools may use only the supplied attendance forecast, capacity comparison, event details, and registration confirmation status. They may not contact participants, alter registrations, change event capacity or details, spend money, or make final event decisions. The agent produces recommendations for the hackathon organizer to review.

### Tool 1
- **Tool name:** `retrieve_attendance_data`
- **Role in this task:** Support Assess attendance risk, Generate organizer recommendations, and Explain recommendation rationale by locating the relevant information in the supplied workflow inputs.
- **Input:** Attendance forecast; Capacity comparison; Event details; Registration confirmation status.
- **Output:** Evidence summary; Unresolved issues.
- **Implementation Route:** File operations restricted to the supplied workflow inputs.
- **Integration approach:** Direct integration.
- **Task timeout:** Subject to the same 120-second total task deadline. Each call may take at most 5 seconds or the remaining task time, whichever is shorter.
- **Maximum retries:** 1 additional attempt per invocation, subject to the task-wide call and time limits.
- **Retry only when:** A temporary file-access or read error prevents completion. Wait 2 seconds and retry only if enough time and call budget remain. Do not retry an invalid input reference or confirmed missing required input. This tool is read-only, so retries do not create duplicate records or messages.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the affected input and failure in the unresolved issues. If the missing information prevents a supported recommendation, stop the task and hand the case to the hackathon organizer. Do not continue as if the missing information was successfully retrieved.

### Tool 2
- **Tool name:** `check_attendance_thresholds`
- **Role in this task:** Support Assess attendance risk and Generate organizer recommendations by comparing the attendance forecast, event capacity, and registration confirmation status to identify supported risks such as low attendance, overcrowding, or uncertainty from unconfirmed registrants.
- **Input:** Attendance forecast; Capacity comparison; Registration confirmation status.
- **Output:** Result or recommendation; Evidence summary; Unresolved issues.
- **Implementation Route:** Functions/scripts performing deterministic comparisons of supplied attendance, capacity, and registration values.
- **Integration approach:** Direct integration.
- **Task timeout:** Subject to the same 120-second total task deadline. Each call may take at most 5 seconds or the remaining task time, whichever is shorter.
- **Maximum retries:** 0.
- **Retry only when:** Not applicable. A later comparison using materially changed input is a new invocation, not a retry, and must remain within the task-wide call and time limits.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the failed comparison and affected inputs in the unresolved issues. If the attendance risk cannot be determined from the remaining information, stop the task and hand the case to the hackathon organizer. Do not interpret a processing error as evidence of low attendance, overcrowding, or another attendance risk.

This tool must return an unresolved result when a comparison requires missing information or an unstated assumption. It is read-only and may not change event capacity, registration status, or event details or make the organizer's final decision, so retries or repeated comparisons do not create duplicate records or messages.

## 4. How the Agent Should Reason
### Permitted Subtask 1
- **Subtask name:** Assess attendance risk
- **Subtask description:** Examine the attendance forecast and capacity comparison to identify whether the event faces low attendance, overcrowding, or uncertainty from unconfirmed registrants.
- **Subtask boundary:** May identify and summarize risks using the provided inputs. May not change capacity, registration status, or event details.
- **Retry limits:** Perform once with the current inputs. Repeat once only if the inputs are inconsistent and another permitted subtask provides information that could resolve the inconsistency. If the inconsistency remains after the second attempt, hand the case to the hackathon organizer.

### Permitted Subtask 2
- **Subtask name:** Generate organizer recommendations
- **Subtask description:** Use the identified risk and event details to produce relevant possible actions, such as sending confirmation reminders, increasing outreach, opening or closing a waitlist, or adjusting planning estimates.
- **Subtask boundary:** May recommend actions only. May not contact participants, alter registrations, spend money, or make final event decisions.
- **Retry limits:** Perform once with the current information. Repeat once only if another permitted subtask produces new material information or identifies an inconsistency. If the available information still does not support a safe recommendation, hand the case to the hackathon organizer.

### Permitted Subtask 3
- **Subtask name:** Explain recommendation rationale
- **Subtask description:** Connect each recommendation to the forecast, capacity comparison, and event details so the organizer can understand why it was suggested.
- **Subtask boundary:** May summarize the evidence available in the inputs. May not claim certainty or use information not provided by the workflow.
- **Retry limits:** Perform once for each supported recommendation. Revise once only if new material information changes the recommendation or its supporting evidence. If the evidence remains missing or unclear, record the issue as unresolved and hand it to the hackathon organizer.
  
- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** The agent has produced one or more supported recommendations, explained the attendance risk behind each recommendation, and identified any remaining uncertainty.
- **Hand off early when:** Attendance forecast data is missing, registration data conflicts, or forecast confidence is below 70 percent. Also hand off when a recommendation would require a decision about budget, event capacity, participant communication, or event policy.
- **Handoff recipient:** Hackathon organizer, who reviews the information and makes the final decision.

Stop at the first applicable task-wide limit or handoff condition. After handoff, take no further autonomous action until the hackathon organizer reviews the case.

## 6. Outbound Deliverable

- **Status:** Completed when recommendations are supported by the attendance forecast and event details; escalated to human when information is missing, conflicting, or too uncertain.
- **Result or recommendation:** Recommended organizer actions for the identified attendance risk. If the task is escalated before a supported recommendation can be made, write `undetermined`.
- **Evidence summary:** The attendance forecast, forecast confidence, event capacity comparison, registration status, and event details that support the recommendation.
- **Subtasks performed:** The permitted subtasks completed, including any repeated attempts: Assess attendance risk, Generate organizer recommendations, and Explain recommendation rationale.
- **Unresolved issues:** Remaining uncertainty, missing data, conflicting registration records, or decisions requiring organizer approval. Write `none` only when the task is completed successfully.
- **Handoff note:** For escalated cases, explain why the task stopped, identify the unresolved issue, and state the decision the hackathon organizer must make. Write `Not applicable` for a completed task.
- **Next task or recipient:** T9 Review recommendations — the hackathon organizer reviews and approves the recommendation. Unresolved cases also go to the hackathon organizer.
