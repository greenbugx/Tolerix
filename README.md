# Tolerix

**Precision before production.**

Tolerix is an AI-assisted manufacturing preflight web application designed for small laser-cutting businesses, acrylic and signage shops, custom-product makers, and fabrication workshops.

It bridges the gap between what a customer requests and the actual vector drawing file prepared for manufacturing, calculating geometric discrepancies deterministically and generating an evidence-backed pre-production audit report.

## Architecture

Tolerix operates on a strict local-first architecture. There is no remote backend, hosted database, cloud sync, or external API dependency.

- **Frontend & App Shell:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router, TanStack Query, Zod.
- **Persistent Data Layer:** IndexedDB managed via Dexie for jobs, files, machine profiles, specifications, audit runs, and findings.
- **Local Model Storage:** Browser Cache Storage API (`tolerix-models-v1`) for streaming and caching verified LiteRT-LM model weights.
- **Local AI Execution:** On-device WebGPU inference using `@litert-lm/core` LiteRT-LM runtime. Runtime WASM assets are self-hosted directly from `/runtime/litert/`.
- **Deterministic Geometry Service:** Deterministic path bounds, closed contour verification, transform matrix accumulation, and unit conversion without neural network guesswork.

## Supported Local Gemma Models

Tolerix integrates on-device Gemma models for natural language order extraction. The models are downloaded only after explicit operator action.

| Model | Upstream Repository | Artifact | Size | License | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemma 4B** | `litert-community/gemma-4-E4B-it-litert-lm` | `gemma-4-E4B-it-web.litertlm` | ~2.76 GB | Apache-2.0 (Gemma terms apply) | High precision on-device candidate requirements extraction |
| **Gemma 2B** | `litert-community/gemma-4-E2B-it-litert-lm` | `gemma-4-E2B-it-web.litertlm` | ~1.87 GB | Apache-2.0 (Gemma terms apply) | Fast lightweight on-device candidate requirements extraction |

Models are fetched directly from Hugging Face into Cache Storage, supporting streaming progress, cancellation, and local deletion without deleting workshop job records. Once cached, model inference executes without an internet connection.

## System & Hardware Requirements

- **Browser:** Chromium-based browsers with WebGPU enabled (Chrome 113+, Edge 113+, Brave, or Firefox with dom.webgpu.enabled).
- **GPU:** Dedicated or modern integrated GPU with at least 4 GB VRAM for Gemma 2B, or 6 GB+ for Gemma 4B.
- **Storage:** At least 5 GB of free browser storage allocation for caching local weights and persistent job vector files.
- **Fallback:** If WebGPU is unavailable or models are not yet downloaded, Tolerix automatically provides deterministic heuristic extraction and manual entry so the workflow remains completely accessible.

## Job Workflow

Tolerix implements an operator-governed 4-step creation pipeline followed by analysis and review:

1. **Order Details:** Enter customer reference, job title, and raw instructions.
2. **Upload File:** Drag and drop or browse production SVG or DXF files. Files are sanitized and stored locally.
3. **Confirm Requirements:** Review candidate dimensions, units, quantity, material, thickness, and operations extracted by Gemma or manual input.
4. **Machine Profile:** Select machine limits, cutting kerf, minimum feature size, and bed envelopes (e.g. Thunder Laser Nova 35).
5. **Analysis:** Deterministic geometry engine checks dimensions, closed paths, duplicate paths, layer stroke conventions, and flags mismatches with reproducible evidence.
6. **Review & Submit:** Final sign-off displaying design rendering, machine specifications, cost/time estimates, and required operator rights confirmation before marking a job ready.

## Deterministic Geometry Engine

- Physical unit normalization (`mm`, `cm`, `in`, `pt`, `pc`, `px` at standard 96 DPI).
- 2D affine transform matrix stack (`matrix`, `translate`, `scale`, `rotate`, `skewX`, `skewY`).
- Distinguishes SVG canvas viewport tags from actual transformed path bounds.
- Unverified parameter handling: Material composition, physical sheet thickness, and machine hardware safety cannot be deduced from 2D vector coordinates and are strictly marked unverified.

## Development & Testing

### Installation

```bash
pnpm install
```

### Development Server

```bash
pnpm run dev
```

### Production Build

```bash
pnpm run build
```

### Run Test Suite

```bash
pnpm test
```

### Code Quality Check

```bash
pnpm run lint
```

## Security & Data Privacy

- All vector drawings, customer communications, and machine parameters stay on your workstation.
- SVG documents are sanitized: active script tags, inline event handlers, external entity definitions (XXE), and remote HTTP references are rejected.
- Zero telemetry, analytics cookies, or remote tracking beacons.
