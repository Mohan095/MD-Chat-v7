# TXT Chat

A small single-page group chat made with HTML, CSS, JavaScript and Python (Flask).
Messages from everyone are written as one JSON-per-line record in a daily `.txt` file.

## Run on Windows

1. Install Python 3.10 or newer.
2. Open PowerShell in this folder.
3. Create and activate a virtual environment (optional but recommended):

   ```powershell
   py -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

4. Install packages:

   ```powershell
   pip install -r backend/requirements.txt
   ```

5. Start the chat:

   ```powershell
   python backend/app.py
   ```

6. Open `http://127.0.0.1:5000` in your browser.

## Use from another device on the same Wi-Fi

Find this computer's local IPv4 address with `ipconfig`, then open
`http://YOUR-IP:5000` on the other device. Allow Python through Windows
Firewall on a trusted private network if Windows asks.

## Project layout

- `frontend/` — `index.html`, `admin.html`, `style.css`, `app.js`
- `backend/` — `app.py`, `requirements.txt`, `data/`, `uploads/`, `backup/`

## Storage layout

- `backend/data/chats/2026-11-26.txt` contains all messages sent on that date.
- Each new date automatically gets its own TXT file.
- Uploaded files are saved in `backend/uploads/`; `backend/backup/` mirrors `data/` and `uploads/`.

Each TXT line is a JSON record so the app can safely preserve names, message text,
timestamps and attachment details. This is a local-learning project, not a secure
internet production chat: there is no login/password system, encryption, moderation,
or private-chat isolation. Anyone who can access the app can read the shared room.
Do not expose it directly to the public internet or upload sensitive documents.
