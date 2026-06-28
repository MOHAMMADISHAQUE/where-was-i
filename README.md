# Kahan Tha Main?

*Hindi for "Where Was I?" — because every dev asks this every morning.*

Never lose context between coding sessions again.

**Kahan Tha Main** is a VS Code extension that saves your exact work state before you close — and brings you back to it instantly the next time you open VS Code.

---

## The Problem

You're deep in a bug fix. Files open, cursor in the right place, mental context fully loaded. You close VS Code.

Next morning: blank slate. 15–30 minutes just rebuilding what you already knew.

## The Solution

Kahan Tha Main saves your session automatically when you close VS Code and shows you a clean summary the moment you reopen your project. Pick up exactly where you left off.

---

## Features

### Multiple Named Sessions
Save as many sessions as you want per project — one for each task, bug, or feature branch. Each session is independent and resumable anytime.

- Name your session: "fixing login bug", "payment feature", "refactor auth"
- Switch between sessions without losing any context
- Delete sessions you're done with

### Auto-Save on Close
No need to remember to save. When you close VS Code, your latest session is automatically updated with your current files, cursor position, and branch.

### One-Click Resume
Click **Resume** on any session card to reopen all its files and jump the cursor back to the exact line you left off.

### Session Cards
Each saved session shows at a glance:
- **Session name** — what you were working on
- **🌿 Branch** — which git branch you were on
- **📁 Files** — how many files were open
- **🎯 Active file** — the exact file and line your cursor was on

### Desi Greeting on Every Open
Because context switching is already painful enough — at least get a laugh when you come back. A random witty Hindi greeting welcomes you every time you open VS Code.

### Keyboard Shortcut
Save a session instantly with `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux).

---

## How to Use

1. Open a project in VS Code
2. Click the **Kahan Tha Main icon** in the left activity bar
3. Type a session name and click **Save Session**
4. Close VS Code — your session auto-saves
5. Next time you open, click **Resume** on any session card to restore everything
6. Delete sessions you no longer need with the 🗑 button

---

## Requirements

- VS Code 1.124.0 or higher
- No API keys, no accounts, no internet connection required
- Works fully offline — all data stored locally on your machine

---

## Release Notes

### 0.0.1
Initial release — multiple named sessions, auto-save on close, one-click resume, desi greetings, keyboard shortcut, session cards with branch and cursor info.
