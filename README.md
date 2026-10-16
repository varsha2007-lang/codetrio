# PayGuard AI

**Pause. Understand. Verify. Pay Safely.**

PayGuard AI is a functional, advisory prototype for safer digital payments. It helps people review suspicious messages, double-check payment amounts and recipients, ask beginner-friendly safety questions, and practice with offline scenarios. It never initiates a payment and never asks for a PIN, OTP, password, or bank credentials.

> PayGuard AI is not a bank, payment service, or fraud-detection guarantee. A warning is a reason to verify, not proof of fraud; the absence of a warning does not mean a message is safe.

## Requirements

- Node.js 18+ and npm
- Python 3.10+
- Optional: an OpenAI-compatible local inference server hosting an open-weight instruction-tuned model, or the optional Transformers provider and a compatible installed model/runtime

No model weights or credentials are included. The default configuration is rule-based with AI explicitly unavailable.

## Install and run

Open two terminals from the repository root.

### Backend (FastAPI)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item ..\.env.example ..\.env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API docs are at http://127.0.0.1:8000/docs and health at http://127.0.0.1:8000/api/health.

### Frontend (React + Vite)

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173. The frontend defaults to `http://localhost:8000/api`; override with `VITE_API_BASE` if needed. `VITE_` variables are public browser configuration and must never contain secrets.

## Model configuration

Model configuration is read only by the backend from environment variables (copy `.env.example` to `.env`). **Never put a model key in a `VITE_` variable or commit `.env`.**

- `MODEL_PROVIDER=none` (default): deterministic checks, no model request. The UI displays **AI analysis unavailable** where applicable; there is no fabricated AI output.
- `MODEL_PROVIDER=openai_compatible`: calls a backend-accessible OpenAI-compatible `/v1/chat/completions` endpoint. Set `MODEL_BASE_URL`, `MODEL_NAME`, optional backend-only `MODEL_API_KEY`, and `MODEL_TIMEOUT_SECONDS`. This works with local serving stacks such as vLLM or llama.cpp server when configured to expose a compatible API.
- `MODEL_PROVIDER=transformers`: optional local Python `transformers` text-generation pipeline using `MODEL_NAME` and `MODEL_DEVICE`. Install `transformers` and a suitable PyTorch runtime separately in the backend environment before selecting it; this optional dependency is intentionally not installed by default.

An open-weight model is not assumed to be safe, accurate, available, or license-compatible just because it is configured. Model output is schema-validated. If inference fails, analysis returns the rule-based result and a truthful status. If model JSON is invalid, the status is **AI response invalid** and deterministic findings are used. Never infer that an AI response was produced unless the status says so.

## Architecture

```text
frontend (React/Vite, accessible responsive UI)
  └── fetch /api/* ──> backend/app/main.py (FastAPI + dev CORS)
                         ├── routes.py (HTTP routes)
                         ├── schemas.py (Pydantic validation)
                         └── services.py (business rules, model adapter, offline scenarios)
```

Business logic is separate from route handlers. Payment checking and learning content need no AI. Scam analysis runs deterministic checks first, then requests contextual analysis when a provider is configured. User text is delimited and explicitly treated as untrusted model input. Messages are not logged or persisted by application code.

## API

All endpoints are prefixed with `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Service status |
| POST | `/analyze-message` | Analyze `{ "message": "..." }`; message is required and limited to 5,000 characters |
| POST | `/check-payment` | Compare `{ "intended_amount": "500", "entered_amount": "5000", "recipient_name": "Asha" }` |
| POST | `/ask-safety` | Ask `{ "question": "What should I do if someone asks for my OTP?" }` |
| GET | `/learning-scenarios` | Return five offline quiz scenarios and answer keys for the prototype UI |

`/analyze-message` returns `risk_category` (`Low Apparent Concern`, `Needs Verification`, `High Concern`), `warning_signs`, `evidence_from_message`, `explanation`, `recommended_actions`, `educational_tip`, `limitations`, and `analysis_status` (`AI analysis complete`, `AI analysis unavailable`, or `AI response invalid`). Bad inputs return HTTP 422. Model/network failures degrade safely to rule-based guidance. `/check-payment` rejects empty, invalid, and negative amounts; mismatches, tenfold extra-zero patterns, and missing recipient names are called out. It does not authorize or make a payment.

Interactive OpenAPI documentation: http://127.0.0.1:8000/docs.

## Tests and build

Run backend tests from `backend/`:

```powershell
python -m pytest -q
```

Run frontend production build from `frontend/`:

```powershell
npm run build
```

Backend tests cover all eight requested cases: ₹500 vs ₹5,000 mismatch/extra zero, equal amount, negative amount, OTP plus suspension threat, ordinary bill reminder, unavailable-model fallback, malformed AI output, and quiz scoring. Frontend build verifies the production bundle; no separate browser automation suite is included.

### Verification performed for this prototype

- Backend: **8 passed** with `pytest` (one upstream Starlette/httpx deprecation warning).
- Python syntax: backend modules compiled successfully with `py_compile`.
- Frontend: Vite production build completed successfully.
- Browser smoke check: home page, Scam Analyzer OTP example with honest fallback status, and ₹500/₹5,000 Payment Checker warning were exercised against the running API.
- **Open-weight inference was not tested.** This run used `MODEL_PROVIDER=none`; no model server, weights, or credential were configured. Therefore there is no tested AI-generated output to claim. Configure a local compatible provider and independently validate it before a demo that requires inference.

## Privacy and safety

- Synthetic examples only. Do not paste real account details, phone numbers, links with private tokens, OTPs, PINs, passwords, or other sensitive information.
- Application code does not save conversations or log full message contents. If a remote inference provider is configured, submitted content is sent to that provider; review its retention and privacy terms first.
- Never share PINs, OTPs, or passwords, including with PayGuard. For account-specific concerns, use your bank's official app, the number printed on your card, or a verified branch—not details in an unexpected message.
- CORS allows the local Vite development origins. Configure an explicit trusted origin list before any deployment; do not use this prototype as a production payment or fraud prevention system.
- The phrase “AI analysis unavailable” honestly identifies rule-only behavior. Low Apparent Concern does not certify safety.

## Known limitations

- Heuristic keyword checks can miss scams and can match benign messages. They are indicators only.
- Model conclusions depend on the configured provider/model and may be wrong, incomplete, slow, or unavailable. Schema checks cannot guarantee factual correctness.
- This prototype has no authentication, payment rail, account connection, persistent history, localization, or production security review. UI is currently English. Speech input is optional and not implemented; browser text-to-speech is available for assistant responses.
- Learning scenarios and their answers are public synthetic content, not a validated curriculum.
- Network errors/timeouts are handled with clear states, but system/provider-level resource limits still apply.

## Demo script (about 2 minutes)

1. Start the backend and Vite frontend; open the home page and show the four feature cards and advisory/privacy notices.
2. Open Scam Analyzer, select **Urgent OTP request**, then analyze. With default configuration, show warning signs and the explicit **AI analysis unavailable** fallback. Load the ordinary bill reminder to show keyword matches are not a verdict.
3. Open Payment Checker, load the ₹500 vs ₹5,000 example, check it, and point out the extra-zero warning. Use **Edit Amount**, **Review Recipient**, and **Check Again**.
4. Open Safety Assistant, choose “Someone asked for my OTP. What should I do?”, ask, then show the safe general guidance and **Read aloud** control.
5. Open Learn Safety, answer the five scenarios, and show the final score.

## Licenses

- Application source: MIT, see [LICENSE](LICENSE).
- Default suggested model: Qwen2.5-3B-Instruct by Qwen, Apache License 2.0; weights are not bundled. See [MODEL-LICENSE.md](MODEL-LICENSE.md) and the upstream model card. If you configure a different model, check its separate terms.
- Dependencies retain their respective licenses.

## Publish to GitHub

1. Review the source and confirm `.env` and credentials are not staged (`.env` is ignored).
2. Create an empty repository on GitHub. Then from this directory run `git init`, `git add .`, `git commit -m "Build PayGuard AI safety prototype"`, `git branch -M main`, `git remote add origin <your-repository-url>`, and `git push -u origin main`.
3. Keep deployment secrets in the hosting provider’s backend-only secret settings. Never publish model keys or real user data.
