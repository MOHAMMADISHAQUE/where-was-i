# Where Was I?

Never lose context between coding sessions again.

**Where Was I** is a VS Code extension that saves your exact work state before you close — and brings you back to it instantly the next day.

---

## The Problem

You're deep in a bug fix. Files open, cursor in the right place, mental context loaded. You close VS Code.

Next morning: blank slate. 15–30 minutes rebuilding what you already knew.

## The Solution

Where Was I saves your session and shows you a clean summary the moment you reopen your project.

---

## Features

### Session Sidebar
A dedicated panel in the activity bar shows your last session at a glance — no commands, no popups.

- **Task note** — what you were working on, findings, next steps
- **Project & branch** — which repo and git branch you were on
- **Open files** — every file you had open, with the active file highlighted
- **Last cursor position** — exactly which line you were editing

### One-Click Resume
Click **Resume Session** to reopen all your files and jump your cursor back to the exact line you left off.

### Inline Task Editing
Click your task note directly in the sidebar to edit it — no input boxes, no command palette.

### Save New Session
When you're done for the day, click **Save New Session**, type what you were doing, and close VS Code. That's it.

---

## How to Use

1. Open a project in VS Code
2. Click the **bookmark icon** in the left activity bar
3. Your last session appears in the sidebar
4. Click **Resume Session** to restore everything
5. Before closing, click **Save New Session** and leave yourself a note

---

## Requirements

- VS Code 1.125.0 or higher
- No API keys, no accounts, no internet connection required
- Works fully offline — all data stored locally on your machine

---

## Release Notes

### 0.0.1
Initial release — session save, resume dashboard, inline editing, sidebar view.
