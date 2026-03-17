# Emergency Reversal & Backup Guide

This file contains instructions on how to undo changes or create a complete backup of your work.

## 1. Fast Backup & Sync (Recommended)
I have created scripts to make backing up your work extremely easy.

### **Local Backup**
This creates an incremental copy of your project in the `backups` folder (one level up). It only copies new or changed files, making it very fast.
- **Run this command:**
  ```powershell
  .\sync_backup.ps1
  ```

### **GitHub Sync (Easy Push)**
This automates the process of adding, committing, and pushing your code to GitHub.
- **Run this command:**
  ```powershell
  .\easy_push.ps1
  ```
- It will ask you for a commit message. If you just press Enter, it will use a timestamp.

## 2. Using Git (For Reverting)
Since your project uses Git, you can revert changes without needing to unzip anything.

### To discard unsaved changes in your current files:
Run this in your terminal:
```powershell
git checkout .
```

### To undo your last commit:
```powershell
git reset --soft HEAD~1
```

### To go back to the specific "Safe Point" I created on 2026-03-16:
```powershell
git reset --hard backup-stable-20260316_2335
```

## 3. Using the ZIP Backup
If Git fails or gets corrupted, you have a physical copy:
- **File:** `backup_20260316_2335.zip`
- **What to do:** 
  1. Delete your current files (except the .git folder and the zip itself).
  2. Extract the contents of the ZIP into this directory.
  3. Run `npm install` to restore dependencies.

---
*Updated by Antigravity on 2026-03-17*
