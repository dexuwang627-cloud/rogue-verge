# rogue-verge-archive

This project now follows the shared baseline in `ENGINEERING_BASELINE/`.

## Project Layout
- `backend/` (if present): API/services/data processing
- `frontend/` (if present): web UI
- `references/` or `document/`: domain files and source materials

## Local Development
### Backend (if exists)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend (if exists)
```bash
cd frontend
npm install
npm run dev
```

## Quality Gates
- Backend: `pytest -q` (if tests exist)
- Frontend: `npm run lint`, `npm run build`, `npm test` (if defined)
