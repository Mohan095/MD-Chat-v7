from flask import Flask, request, jsonify, send_from_directory, abort
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from pathlib import Path
import json, os, re, shutil, uuid

app = Flask(__name__)
ROOT = Path(__file__).resolve().parent
STORAGE_ROOT = Path(os.environ.get("STORAGE_DIR") or ROOT)
DATA_DIR = STORAGE_ROOT / "data" / "chats"
ROOMS_DIR = DATA_DIR / "rooms"
UPLOAD_DIR = STORAGE_ROOT / "uploads"
USERS_FILE = STORAGE_ROOT / "data" / "users.json"
FRIENDS_FILE = STORAGE_ROOT / "data" / "friends.json"
BACKUP_DIR = STORAGE_ROOT / "backup"

DATA_DIR.mkdir(parents=True, exist_ok=True)
ROOMS_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "txt", "pdf", "doc", "docx"}
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB per upload


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def room_dir(room="everyone"):
    room = (room or "everyone").strip()
    if room == "everyone":
        return DATA_DIR
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", room)[:80]
    if not safe:
        return DATA_DIR
    d = ROOMS_DIR / safe
    d.mkdir(parents=True, exist_ok=True)
    return d


def today_file(room="everyone"):
    return room_dir(room) / f"{datetime.now().strftime('%Y-%m-%d')}.txt"


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def read_day(day, room="everyone"):
    try:
        datetime.strptime(day, "%Y-%m-%d")
    except ValueError:
        abort(400, "Invalid date")
    path = room_dir(room) / f"{day}.txt"
    messages = []
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    messages.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return messages


def sync_backup():
    """Mirror data/ and uploads/ into backup/ on startup and after every change."""
    data_src = STORAGE_ROOT / "data"
    if data_src.exists():
        shutil.copytree(data_src, BACKUP_DIR / "data", dirs_exist_ok=True)
    if UPLOAD_DIR.exists():
        shutil.copytree(UPLOAD_DIR, BACKUP_DIR / "uploads", dirs_exist_ok=True)
    (BACKUP_DIR / "last_backup.txt").write_text(
        datetime.now().isoformat(timespec="seconds") + "\n",
        encoding="utf-8"
    )


sync_backup()


def write_day(day, messages, room="everyone"):
    try:
        datetime.strptime(day, "%Y-%m-%d")
    except ValueError:
        abort(400, "Invalid date")
    path = room_dir(room) / f"{day}.txt"
    if not messages:
        if path.exists():
            path.unlink()
        sync_backup()
        return
    with path.open("w", encoding="utf-8") as f:
        for item in messages:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    sync_backup()


def read_users():
    if not USERS_FILE.exists():
        return []
    try:
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def record_user(name, email):
    if not name or not email:
        return
    users = read_users()
    key = (name.lower(), email.lower())
    for u in users:
        if (u.get("name", "").lower(), u.get("email", "").lower()) == key:
            u["last_seen"] = datetime.now().isoformat(timespec="seconds")
            USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")
            sync_backup()
            return
    users.append({
        "name": name,
        "email": email,
        "last_seen": datetime.now().isoformat(timespec="seconds")
    })
    USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")
    sync_backup()


def file_category(filename, mimetype=""):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in {"png", "jpg", "jpeg", "gif", "webp"} or mimetype.startswith("image/"):
        return "image"
    if ext in {"doc", "docx"}:
        return "word"
    if ext == "pdf":
        return "pdf"
    if ext == "txt":
        return "txt"
    return "other"


@app.get("/")
def health():
    return jsonify(status="ok", app="MD Chat v7 Backend")


@app.get("/api/days")
def days():
    room = request.args.get("room", "everyone")
    names = sorted(p.stem for p in room_dir(room).glob("????-??-??.txt") if p.is_file())
    return jsonify(names)


@app.get("/api/messages")
def messages():
    day = request.args.get("day", datetime.now().strftime("%Y-%m-%d"))
    room = request.args.get("room", "everyone")
    return jsonify(read_day(day, room))


@app.post("/api/send")
def send_message():
    sender = request.form.get("sender", "").strip()[:40]
    email = request.form.get("email", "").strip()[:80]
    room = request.form.get("room", "everyone").strip()
    message = request.form.get("message", "").strip()[:5000]
    upload = request.files.get("file")
    if len(sender) < 3:
        return jsonify(error="Username must be at least 3 characters."), 400
    if email and not email.lower().endswith("@gmail.com"):
        return jsonify(error="Email must be a @gmail.com address."), 400
    if not message and (not upload or not upload.filename):
        return jsonify(error="Type a message or attach a file."), 400

    attachment = None
    if upload and upload.filename:
        original = secure_filename(upload.filename)
        if not allowed_file(original):
            return jsonify(error="Allowed files: image, TXT, PDF, DOC and DOCX."), 400
        stored = f"{uuid.uuid4().hex}_{original}"
        upload.save(UPLOAD_DIR / stored)
        attachment = {
            "name": original,
            "url": f"/uploads/{stored}",
            "type": upload.mimetype or "application/octet-stream"
        }

    item = {
        "id": uuid.uuid4().hex,
        "sender": sender,
        "email": email,
        "message": message,
        "time": datetime.now().isoformat(timespec="seconds"),
        "attachment": attachment
    }
    if email:
        record_user(sender, email)
    with today_file(room).open("a", encoding="utf-8") as f:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")
    sync_backup()
    return jsonify(item)


@app.get("/api/users")
def list_registered_users():
    exclude = request.args.get("exclude", "").strip().lower()
    users = [
        {"name": u.get("name", ""), "email": u.get("email", "")}
        for u in read_users()
        if u.get("name", "").lower() != exclude
    ]
    return jsonify(users)


@app.get("/api/friends")
def get_friends():
    user = request.args.get("user", "").strip().lower()
    if not FRIENDS_FILE.exists():
        return jsonify([])
    try:
        all_friends = json.loads(FRIENDS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        all_friends = {}
    return jsonify(all_friends.get(user, []))


@app.post("/api/friends")
def add_friend():
    data = request.get_json(silent=True) or {}
    user = (data.get("user") or "").strip().lower()
    friend_name = (data.get("name") or "").strip()[:40]
    friend_email = (data.get("email") or "").strip()[:80]
    if not user:
        return jsonify(error="Please login first."), 400
    if len(friend_name) < 3:
        return jsonify(error="Friend name must be at least 3 letters."), 400
    if friend_name.lower() == user:
        return jsonify(error="You cannot add yourself as a friend."), 400
    if friend_email and not friend_email.lower().endswith("@gmail.com"):
        return jsonify(error="Friend email must end with @gmail.com."), 400

    registered = read_users()
    matched = None
    for u in registered:
        u_name = u.get("name", "")
        u_email = u.get("email", "")
        if u_name.lower() == friend_name.lower():
            if friend_email and u_email.lower() != friend_email.lower():
                continue
            matched = u
            break
    if not matched:
        return jsonify(error="User not found. Only logged-in / registered users can be added."), 400

    try:
        all_friends = json.loads(FRIENDS_FILE.read_text(encoding="utf-8")) if FRIENDS_FILE.exists() else {}
    except (json.JSONDecodeError, OSError):
        all_friends = {}
    lst = all_friends.get(user, [])
    if not any(f.get("name", "").lower() == matched["name"].lower() for f in lst):
        lst.append({"name": matched["name"], "email": matched["email"]})
        all_friends[user] = lst
        FRIENDS_FILE.write_text(json.dumps(all_friends, ensure_ascii=False, indent=2), encoding="utf-8")
        sync_backup()
    return jsonify(lst)


@app.post("/api/login")
def login_user():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()[:40]
    email = (data.get("email") or "").strip()[:80]
    if len(name) < 3:
        return jsonify(error="Username must be at least 3 letters."), 400
    if not email.lower().endswith("@gmail.com"):
        return jsonify(error="Email must end with @gmail.com."), 400
    record_user(name, email)
    is_admin = name.lower() == "admin" and email.lower() == "admin@gmail.com"
    return jsonify(name=name, email=email, is_admin=is_admin)


@app.get("/api/admin/data")
def admin_data():
    users_map = {}
    for u in read_users():
        key = (u.get("name", "").lower(), u.get("email", "").lower())
        users_map[key] = {
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "last_seen": u.get("last_seen", ""),
            "messages": 0
        }

    chats = []
    files = []
    for path in sorted(DATA_DIR.glob("????-??-??.txt"), reverse=True):
        day = path.stem
        for item in read_day(day):
            sender = item.get("sender", "")
            email = item.get("email", "")
            key = (sender.lower(), email.lower())
            if key not in users_map:
                users_map[key] = {
                    "name": sender,
                    "email": email or "—",
                    "last_seen": item.get("time", ""),
                    "messages": 0
                }
            users_map[key]["messages"] += 1
            chats.append({
                "day": day,
                "id": item.get("id", ""),
                "sender": sender,
                "email": email or "—",
                "message": item.get("message", ""),
                "time": item.get("time", ""),
                "edited": bool(item.get("edited")),
                "attachment": item.get("attachment")
            })
            att = item.get("attachment")
            if att:
                files.append({
                    "name": att.get("name", ""),
                    "url": att.get("url", ""),
                    "type": att.get("type", ""),
                    "category": file_category(att.get("name", ""), att.get("type", "")),
                    "sender": sender,
                    "email": email or "—",
                    "day": day,
                    "time": item.get("time", "")
                })

    chats.sort(key=lambda c: c.get("time", ""), reverse=True)
    files.sort(key=lambda f: f.get("time", ""), reverse=True)
    users = sorted(users_map.values(), key=lambda u: u.get("messages", 0), reverse=True)
    return jsonify(users=users, chats=chats, files=files)


@app.post("/api/edit")
def edit_message():
    data = request.get_json(silent=True) or {}
    day = data.get("day", "")
    room = data.get("room", "everyone")
    msg_id = data.get("id", "")
    sender = (data.get("sender") or "").strip()
    new_text = (data.get("message") or "").strip()[:5000]
    if not new_text:
        return jsonify(error="Message cannot be empty."), 400
    messages = read_day(day, room)
    for item in messages:
        if item.get("id") == msg_id:
            if item.get("sender") != sender:
                return jsonify(error="You can only edit your own message."), 403
            try:
                sent_at = datetime.fromisoformat(item["time"])
            except (KeyError, ValueError):
                return jsonify(error="Cannot verify message time."), 400
            if datetime.now() - sent_at > timedelta(seconds=15):
                return jsonify(error="Edit time expired (15 seconds limit)."), 400
            item["message"] = new_text
            item["edited"] = True
            write_day(day, messages, room)
            return jsonify(item)
    return jsonify(error="Message not found."), 404


@app.post("/api/delete")
def delete_messages():
    data = request.get_json(silent=True) or {}
    day = data.get("day", "")
    room = data.get("room", "everyone")
    ids = set(data.get("ids") or [])
    if not ids:
        return jsonify(error="No messages selected."), 400
    messages = read_day(day, room)
    remaining = [m for m in messages if m.get("id") not in ids]
    write_day(day, remaining, room)
    return jsonify(deleted=len(messages) - len(remaining))


@app.get("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)


@app.errorhandler(413)
def too_large(_):
    return jsonify(error="File is too large. Maximum size is 20 MB."), 413


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
