# Meeting Timer Refactoring Plan

## 1. MeetingContext Structure Refactoring

### Current State Analysis:

The `MeetingContext.types.ts` file currently contains:

- Context type definition (`MeetingContextType`)
- Reducer function (`reducer`)
- Context creation (`MeetingContext`)

This violates the single responsibility principle and makes the code harder to maintain.

### Refactoring Steps:

#### Step 1: Split into separate files

**File: `src/context/types.ts`**

- Move Stage type definition here

**File: `src/context/reducer.ts`**

- Move MeetingState, Action types and initialState here
- Keep reducer function here

**File: `src/context/utils.ts`**

- Move utility functions (`calculatePlannedStageTimes`, `calculateDisplayedStageTimes`) here

#### Step 2: Simplify calculateDisplayedStageTimes function

Extract sub-functions for:

- Start time calculation logic
- Stage iteration and time assignment logic
- Return value construction

#### Step 3: Add comments for complex logic

Add detailed comments explaining the time calculation algorithm

#### Step 4: Improve Stage type using discriminant union

Create different stage types based on state (not started, in progress, completed)

## 2. TimerScreen.tsx Component Refactoring

### Current State Analysis:

The `TimerScreen.tsx` file contains:

- All component logic including audio handling, notification logic, time formatting, and UI rendering
- Complex state management and side effects
- Multiple helper functions mixed with main component

### Refactoring Steps:

#### Step 1: Split into 4 components

**Component: `src/components/TimerDisplay.tsx`**

- Time display logic (stageRemaining, totalRemaining)

**Component: `src/components/StageList.tsx`**

- Stage list rendering and stage completion handling

**Component: `src/components/NotificationModal.tsx`**

- Notification configuration modal

**Component: `src/components/AudioControls.tsx`**

- Audio controls and meeting start logic

#### Step 2: Extract time formatting logic

Move formatTime function to `src/utils/timeUtils.ts`

#### Step 3: Simplify TimerScreen.tsx

Keep only state management and component composition, move complex logic to separate components