# Task Module Components

## `app/tasks/page.tsx`
- **Main Layout Container**: Controls the view switcher, filters, stats, and search.
- **UI Responsibilities**: Table headers, stat cards, quick filter navigation, focus mode toggle.

## `components/tasks/TaskRow.tsx`
- **TaskRow**: Renders a single row in the task table. Handles its own hover/selected states.
- **StatusPill**: Displays task status. Now updated to a clean text + colored dot format instead of a heavy background pill.
- **PriorityChip**: Displays task priority. Minimal label + dot indicator.

## `components/tasks/AIInsightsBanner.tsx`
- **AIInsightsBanner**: A sleek contextual bar displaying warnings (overdue, blocked, risk). Uses light styling and 1px borders.
