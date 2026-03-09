# Research Publication Workstation Design

## Context

`Apatheia Political Rhetoric Observatory` currently behaves like a dense multi-panel archive dashboard. It already contains strong primitives for actor dossiers, evidence browsing, contradiction inspection, source review, and quantitative analysis, but those capabilities are spread across too many equal-weight surfaces.

The user intent is not to build a generic political dashboard. The product is meant to serve as a single-researcher workstation for:

- investigating a specific actor or issue
- producing defensible findings from linked evidence
- drafting publishable articles and research briefs
- preserving transparent source chains for public accountability work

## Problem

The current UX exposes many powerful surfaces but does not provide a coherent end-to-end research workflow. The user can inspect records, but the interface does not yet reliably support the full path from:

1. select investigation subject
2. inspect and compare evidence
3. collect and organize supporting records
4. synthesize findings
5. draft a publication-ready article section

The result is a product that feels rich but not yet operational as a daily investigative workstation.

## Product Goal

Transform the observatory from a dashboard into a desktop-first `research-to-publication workstation` that helps one researcher move quickly from evidence to findings to publishable draft copy while preserving traceability.

## User Model

Primary user:

- one investigative researcher using the app directly
- operating on desktop or laptop
- analyzing a specific issue and specific actors
- writing public-facing research articles or briefs from the archive

Primary success outcome:

- the user can generate source-backed findings and article drafts quickly without losing evidence provenance

## Non-Goals For The First Pass

- full CMS or newsroom publishing stack
- multi-user collaboration
- auto-generated article writing
- perfect mobile-first experience
- broad IA rewrite for every possible research mode

## UX Principles

1. `Actor-first investigation`
   The fastest path should be selecting one actor and tracing their evidence, contradictions, source base, and related issue context.

2. `Single source of truth for investigation context`
   The interface should have one canonical investigation actor, with theme/document/lens/search acting only as secondary scoping controls.

3. `Evidence before interpretation`
   Findings and writing tools should always link back to evidence and sources.

4. `No dead ends`
   Every panel should present a clear next action such as inspect, pin, synthesize, draft, or reset.

5. `Transparent research workflow`
   The system should separate source material, researcher findings, and publication draft content.

## Approved Information Architecture

The first-pass IA is organized by researcher intent, not just data type.

### 1. Investigate

This workspace is the primary entry point.

Core layout:

- top working-set bar showing current actor, active filters, source scope, counts, and reset controls
- left rail with actor chooser, saved shortcuts, and high-signal pivots
- main column for actor snapshot, trajectory, evidence stream, contradiction stack, and source base
- right rail or persistent drawer for pinned records and analyst notes

The existing actor, evidence, contradiction, source, and analytics surfaces remain useful, but are subordinated to this workflow.

### 2. Synthesize

This workspace turns inspected records into structured research findings.

Core layout:

- findings board of user-authored research conclusions
- each finding links to evidence, contradictions, documents, and optional quantitative analysis
- confidence/completeness cues indicating how well-supported the finding is
- explicit unresolved-notes support so open questions remain visible

### 3. Write

This workspace turns findings into publishable outputs.

Core layout:

- article builder with title, dek, outline blocks, and draft sections
- insertion of pinned findings, quotes, contradiction summaries, and source references
- export to markdown or clean copyable article text
- research appendix or evidence packet view for transparency

## Canonical State Model

The current split between `activeProfileId` and `profile` should be collapsed into one canonical investigation subject.

### Canonical state

- `investigationActorId`
- `activeWorkspace`
- `filters.search`
- `filters.theme`
- `filters.doc`
- `filters.lens`
- `pins`
- `findings`
- `draft`

### State rules

- selecting an actor anywhere sets `investigationActorId`
- selecting an actor does not rely on search text
- filters narrow the current actor investigation rather than replacing it
- reset filters keeps the actor selected
- clear investigation removes the actor selection and returns to the neutral entry state

## Interaction Rules

### Actor interactions

- actor picker, actor list, command palette, charts, and actor chips all route through the same actor-selection handler
- selecting an actor updates the working-set banner and opens the most relevant investigation surface

### Drilldowns

- evidence click opens evidence detail without losing actor context
- contradiction click opens contradiction detail without losing actor context
- source click opens source context scoped to the current actor where possible
- theme click enters issue context but preserves current actor investigation unless explicitly cleared

### Empty and failure states

- before an actor is selected, the interface shows a guided entry state with suggested actors and recent high-signal records
- sparse data does not collapse the UI; instead, the dossier shell remains visible with specific empty-state copy
- failed API loads surface a visible retry state instead of silent partial rendering

## Research Workflow Design

### Pinning

Pinning is the bridge between investigation and synthesis.

Users can pin:

- evidence records
- contradiction records
- source files

Pinned records remain visible across tabs and can be used to seed findings and draft sections.

### Findings

A finding is a structured research claim created by the user.

Each finding contains:

- title
- thesis statement
- linked evidence IDs
- linked contradiction IDs
- linked document IDs
- optional quantitative support
- unresolved note

Findings are not free-floating notes. They must remain linked to archive material.

### Drafting

Draft content is a publication workspace, not just a notes field.

The writing surface should support:

- inserting a finding as a draft block
- inserting direct quotes with attribution
- inserting source-backed contradiction summaries
- keeping links back to the underlying research context

## Persistence Strategy

First-pass persistence should be local and lightweight.

Persist in browser storage:

- selected actor
- pinned records
- findings
- draft content

This is enough to make the workstation practically usable for one researcher without requiring a full backend collaboration model in the first pass.

## Quantitative Analysis Integration

The existing analysis engine should become a synthesis aid rather than a separate novelty surface.

Relevant outputs:

- sentiment summaries
- position trend summaries
- contradiction concentration
- rhetoric patterns

These should be surfaced where they strengthen findings and drafts, not as detached analytics panels that compete with the evidence workflow.

## Reliability Requirements

- explicit loading, ready, empty, and failed states for every major surface
- no silent API failure
- no context loss when navigating between evidence, contradiction, source, synthesis, and writing surfaces
- all major actions should produce obvious UI feedback

## Accessibility And Device Scope

First pass should be `desktop-first` with strong keyboard support and accessible semantics. Mobile support should remain functional, but the main optimization target is long-form research and writing on desktop and laptop.

## Success Criteria

The workstation is considered successful when:

- the user can reach a focused actor investigation in under 3 clicks
- the user can create a saved finding from inspected records in under 2 minutes
- the user can produce a source-backed article section in under 5 minutes
- every finding is traceable to source material without ambiguity
- the user is never left at a dead-end screen without a clear next step

## Implementation Direction

Recommended implementation direction:

- retain the current visual identity
- reuse existing actor, evidence, contradiction, document, and drawer primitives
- refactor the state model and surface hierarchy around actor-first investigation
- add pin, finding, and draft layers as the bridge from research to publication

This design is approved as the basis for implementation planning.
