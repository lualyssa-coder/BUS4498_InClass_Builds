# Recommend Organizer Actions Task Specification

Create one copy of this template for each Level 3 task identified in class (For this in-class build practice, having one Level 3 task is sufficient).

Save each copy in `my_first_agent/agent/task-specs/`. Rename the file using the task name in lowercase, with hyphens between words. Replace `&` with `and` and remove other punctuation.

Examples:

- `Grade Item Condition` becomes `grade-item-condition.md`
- `Customer Dispute & Compensation Assessment` becomes `customer-dispute-and-compensation-assessment.md`

Keep the **exact** task ID and task name from `workflow-of-tasks.md` inside the file. Replace all bracketed prompts. Leave Section 3 empty; tool permissions and boundaries will be added next week. 

*Remove this sentence and the instructions above before your submission.*

```yaml
# BASIC INFORMATION
task_id: "T8"
task_name: "Recommend organizer actions"
task_owner: "Hackathon organizer"
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

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

### Permitted Subtask 1

- **Subtask name:** Assess attendance risk
- **Substask description:** Examine the attendance forecast and capacity comparison to identify whether the event faces low attendance, overcrowding, or uncertainty from unconfirmed registrants.
- **Subtask boundary:** May identify and summarize risks using the provided inputs. May not change capacity, registration status, or event details.
- **Retry limits:** May be attempted up to two times if inputs are inconsistent. After two attempts, hand off the case for human review.

### Permitted Subtask 2
- **Subtask name:** Generate organizer recommendations
- **Substask description:** Use the identified risk and event details to produce relevant possible actions, such as sending confirmation reminders, increasing outreach, opening or closing a waitlist, or adjusting planning estimates.
- **Subtask boundary:** May recommend actions only. May not contact participants, alter registrations, spend money, or make final event decisions.
- **Retry limits:** May be attempted up to two times. If the available information does not support a safe recommendation, hand off to the organizer.

### Permitted Subtask 3
- **Subtask name:** Explain recommendation rationale
- **Substask description:** Connect each recommendation to the forecast, capacity comparison, and event details so the organizer can understand why it was suggested.
- **Subtask boundary:** May summarize the evidence available in the inputs. May not claim certainty or use information not provided by the workflow.
- **Retry limits:** May be attempted once. If the evidence is missing or unclear, include an unresolved issue for human review.

**

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** Stop successfully when the agent has produced one or more recommendations, explained the attendance risk supporting each recommendation, and clearly identified any uncertainty.
- **Hand off early when:** Hand off early when forecast data is missing, registration data conflicts, the forecast confidence is too low, or a recommendation would require a decision about budget, capacity, participant communication, or event policy.
- **Hand off to:** Unresolved cases are handed to the hackathon organizer for review and final approval.

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** Completed when recommendations are supported by the attendance forecast and event details; escalated to human when information is missing, conflicting, or too uncertain.
- **Result or recommendation:** Recommended organizer actions for the identified attendance risk. If the task is escalated before a supported recommendation can be made, write undetermined.
- **Evidence summary:** The attendance forecast, forecast confidence, event capacity comparison, registration status, and event details that support the recommendation.
- **Subtasks performed:** The permitted subtasks completed, including any repeated attempts: Assess attendance risk, Generate organizer recommendations, and Explain recommendation rationale.
- **Unresolved issues:** Remaining uncertainty, missing data, conflicting registration records, or decisions requiring organizer approval. Write none only when the task is completed successfully.
- **Handoff note:** For escalated cases, explain why the task stopped, identify the unresolved issue, and state the decision the hackathon organizer must make. Write Not applicable for a completed task.
- **Next task or recipient:** Send the completed recommendation to the hackathon organizer for review and approval. Send unresolved cases to the hackathon organizer.
