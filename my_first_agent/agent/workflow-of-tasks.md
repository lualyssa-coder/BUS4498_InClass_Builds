# Workflow of Tasks

*Replace all bracketed prompts with information specific to your proposed system. Delete instructional text that does not belong in your final specification. Add or remove task sections as needed. Every task shown in the general workflow must have a corresponding task specification below.*

## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

[Describe the event, request, schedule, or condition that starts the workflow.]

### 1.3 Completion Condition at Runtime

[Describe how the system knows, on any given run, that this workflow is completed.]

### 1.4 General Workflow

[Describe the overall sequence of tasks in one or two paragraphs. Explain the normal path first, followed by the most important exception paths and human-review points.]

### 1.5 Workflow Diagram

[Insert a flowchart showing the tasks in sequence. Label each task with a task number and short name. Show decision branches, loops, review points, and possible stopping conditions. Below is an example of a Mermaid. You can either edit the mermaid below yourself or ask ChatGPT to generate a Mermaid script based on your workflow description above. Give every task a unique ID, such as T1, T2, and T3, and name tasks using a verb and an object in the mermaid.]

```mermaid
flowchart TD
    T1["T1: First task"] --> T2["T2: Second task"]
    T2 --> D1{"Decision condition?"}
    D1 -->|Yes| T3["T3: Next task"]
    D1 -->|No| H1["Human review"]
    H1 --> T3
    T3 --> C1([C1: Completion state])
```
