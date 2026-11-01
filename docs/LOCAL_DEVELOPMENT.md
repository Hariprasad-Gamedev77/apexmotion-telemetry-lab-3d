# Local Development

## Requirements

- Node.js compatible with the project's lockfile and npm.
- Python 3 and the dependencies in `python-collector/requirements.txt` only if working on the collector.
- A WebGL-capable browser for the synthetic 3D demo.

## Frontend

```powershell
npm install
npm run dev
npm test
npm run build
```

Open `http://localhost:3000`. Synthetic mode runs without an API or simulator. The OpenF1 browser needs network access; if unavailable, it shows an empty state and does not replace it with fixtures.

## Collector

```powershell
cd python-collector
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m pytest tests/
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The collector decodes only this project's educational fixture packet format. It is not compatible with EA SPORTS F1 or another commercial simulator. The frontend connection page can test a WebSocket handshake but does not subscribe to decoded messages as telemetry.

## Current verification from the 2026-11-01 audit

- `npm.cmd test`: 32 passed, 0 failed after rerunning with external runtime access because sandboxed Node failed during `os.userInfo()` initialization.
- `npm.cmd run build`: passed; 26 routes prerendered.
- Python pytest: not run because neither `python` nor the Windows `py` launcher is available in the audited environment.
- Browser, mobile, production endpoint, collector/network, and physical simulator checks: not performed.

See `QA_FINAL_REPORT.md` for the route audit, limitations and recommended work.
