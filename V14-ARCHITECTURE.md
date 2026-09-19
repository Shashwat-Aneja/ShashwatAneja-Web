# V14 Field Architecture

## Purpose
A personal digital portfolio for Shashwat Aneja. The site is an authored interactive environment, not a services site and not a fake operating system.

## Content map
01 Identity
02 Introduction
03 What I Make
04 Selected Work
05 Workspace
06 Experiments
07 Currently
08 How I Think
09 Journey
10 Notes
11 About
12 Contact

## Interaction principles
- Native scrolling only.
- Motion explains or responds; it is never required for comprehension.
- Lavender is identity/interaction, sage is positive/system state, ember is reserved for unusual or unfinished states.
- Hover is enhancement, never a requirement.
- Every Workspace explicitly distinguishes its browser study from the original repository.
- The robot is a recurring resident, not navigation.

## Workspace studies
1. ARC: pointer-driven field/exploration study.
2. MNIST: 28x28 pixel input study with a transparent note that it is not the trained PyTorch model.
3. Sorting: browser implementation of Bubble Sort over a visual bar field.
4. VR Cricket: draggable bat-angle study representing the physical-input relationship.
5. Xylo: transaction-flow study from invoice to journal to report.

## Project truth
Selected projects and repository links correspond to repositories available under Shashwat-Aneja. No performance metrics or outcomes are invented.

## Robot
The V13 DOM structure is preserved. V14 changes only behavior: the robot is absolutely positioned in document space and its document position is updated from scroll progress, allowing it to travel through the Field without using `position: fixed`.

## Navigation
- Persistent wordmark and primary links.
- Full-screen INDEX.
- Escape closes INDEX.
- Focus is trapped while open.
- Focus returns to the trigger after close.

## Responsive model
Desktop and mobile are deliberately composed separately. Mobile removes hover dependence, reduces visual density, and keeps all primary interactions touch-safe.

## QA expectation
A complete delivery must contain the entire repository, not a subset. Before handoff, validate HTML structure, duplicate IDs, JavaScript syntax, local references, project count, Studio-link absence, responsive layout, interaction state ownership, accessibility affordances, and ZIP integrity.
