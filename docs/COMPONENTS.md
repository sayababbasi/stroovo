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

# Board Module Components

## `app/board/page.tsx`
- **BoardView**: Container for the Kanban board. Manages the header, view/filter segmented controls, search input, and high-level grouping state.

## `components/KanbanBoard.tsx`
- **KanbanBoard**: Renders the drag-and-drop context, columns (using `DroppableColumn`), empty states, and handles visual vertical auto-scrolling during drag operations. 
- Features a minimalistic layout with `#F8FAFC` backgrounds and dashed column borders.

## `components/KanbanCard.tsx`
- **KanbanCard**: Individual task cards on the board. Uses semantic colors for priority chips, displays progress bars, and manages its own hover/drag visual states. Heavily relies on typography for information hierarchy.
