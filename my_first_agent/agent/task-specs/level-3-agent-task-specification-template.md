# [replace-with-your-task-name] Task Specification

Create one copy of this template for each Level 3 task identified in class (For this in-class build practice, having one Level 3 task is sufficient).

Save each copy in `my_first_agent/agent/task-specs/`. Rename the file using the task name in lowercase, with hyphens between words. Replace `&` with `and` and remove other punctuation.

Examples:

- `Grade Item Condition` becomes `grade-item-condition.md`
- `Customer Dispute & Compensation Assessment` becomes `customer-dispute-and-compensation-assessment.md`

Keep the **exact** task ID and task name from `workflow-of-tasks.md` inside the file. Replace all bracketed prompts. Leave Section 3 empty; tool permissions and boundaries will be added next week. 

*Remove this sentence and the instructions above before your submission.*

```yaml
# BASIC INFORMATION
task_id: "[Existing task ID]"
task_name: "[Exact task name from the workflow]"
task_owner: "[Person or team accountable for this task]"
```

## 1. Task Goal

- **Objective:** [What business result should this task produce?]


## 2. Inbound Inputs

*Remove this instruction before your submission.* Describe what the enclosing workflow must provide. Describe the structure of each input; do not invent customer, employee, or event data.

### Input 1

- **Input name:** [Short name]
- **What it contains:** [Information the agent receives]
- **Source:** [Task or person that provides it]

*Copy the “Input” block for each additional input.*

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

*Remove this instruction before your submission.* Define the kinds of work the agent is permitted to perform. Do not prescribe a fixed sequence. The agent chooses its next subtask using intermediate findings and may skip, repeat, or combine permitted subtasks within the limits above. Individual subtasks do not all have to be Level 3. Copy the “Permitted Subtask” block for each additional kind of work the agent may perform.

### Permitted Subtask 1

- **Subtask name:** [Use a verb-object name.]
- **Substask description:** [Explain what information the subtask examines and what finding or intermediate result it produces.]
- **Subtask boundary:** [State what the subtask may and may not do, including any prerequisite or required approval.]
- **Retry limits:** [Maximum number of times this subtask may be attempted before the agent chooses another permitted subtask or hands the case to a person.]

**

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** [What evidence shows that the required result is complete and acceptable? Confidence alone is not enough.]
- **Hand off early when:** [What missing evidence, lack of progress, failure, or out-of-scope finding requires human review?]
- **Hand off to:** [Specific person, role, or review queue]

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

*Remove this instruction before your submission.* Below are the default outbound deliverable items. Please revise as needed or leave them as they are if they fit your Level 3 task.

- **Status:** completed or escalated to human.
- **Result or recommendation:** The completed result. If the task was escalated before reaching a supported result, write undetermined.
- **Evidence summary:**  The most important evidence supporting the result or explaining why no result could be reached.
- **Subtasks performed:**  The permitted subtasks completed, including repeated attempts.
- **Unresolved issues:**  Remaining uncertainties or questions. Write none only when the task has been completed successfully.
- **Handoff note:** Reason for stopping, unresolved questions, and what the reviewer needs to decide; write “Not applicable” for a completed task.
- **Next task or recipient:** Who receives the completed output? Unresolved cases go to the handoff recipient above.
