# VoiceForgeAI

<p align="center">
  <strong>An AI-powered voice agent creation and testing platform.</strong>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-99.3%25-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google&logoColor=white" alt="Gemini" /></a>
  <a href="https://elevenlabs.io/"><img src="https://img.shields.io/badge/ElevenLabs-Voice-000000" alt="ElevenLabs" /></a>
</p>

> **Hackathon prototype:** VoiceForgeAI is an experimental UI/UX platform for designing, configuring, storing, deploying, and testing conversational AI voice agents.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Local Data Storage](#local-data-storage)
- [Supported Languages and Voices](#supported-languages-and-voices)
- [Production Build](#production-build)
- [Troubleshooting](#troubleshooting)
- [Security and Privacy](#security-and-privacy)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

VoiceForgeAI provides a visual workspace for turning a plain-language description into a structured conversational voice-agent configuration. It combines a polished React interface with server-side integrations for:

- AI-assisted agent prompt generation;
- curated and API-fetched ElevenLabs voices;
- ElevenLabs Conversational AI deployment;
- browser-based signed voice sessions;
- agent and conversation-history management; and
- local persistent JSON storage.

The application is especially suitable as a hackathon demonstration, an early voice-agent product concept, or a starting point for building a production voice automation platform.

## Key Features

### AI Agent Generation

- Generate a complete agent configuration from a short description.
- Create a professional agent name and role.
- Produce a warm, concise first message.
- Generate a detailed spoken conversation prompt.
- Select an appropriate temperature and turn timeout.
- Generate suggested questions for testing the agent.
- Automatically fall back to a lighter Gemini model if the primary model fails.

### Voice and Language Support

- Browse curated ElevenLabs voices without an API key.
- Fetch the ElevenLabs voice catalog when a valid key is configured.
- Request Hindi-capable voices through ElevenLabs.
- Select voices for English, Hindi, Hinglish, and mixed-language conversations.
- Attach voice IDs and model preferences to generated agents.

### Agent Management

- Create and update agent configurations.
- Persist agents locally in `data/agents.json`.
- Deploy or update agents through the ElevenLabs Conversational AI API.
- Store the deployed ElevenLabs agent ID alongside the local configuration.
- Delete agents no longer needed.

### Live Testing

- Create signed ElevenLabs conversation sessions.
- Test deployed voice agents in a browser.
- Review suggested test questions.
- Surface API status, missing-key warnings, and request errors clearly.

### Session History

- Save session records through the local API.
- Retrieve session history from the Express server.
- Maintain separate JSON storage for agents and sessions.

### Modern Interface

- React 19 with component-oriented TypeScript code.
- Tailwind CSS 4 styling.
- Three.js and React Three Fiber visual support.
- ShaderGradient and Motion for rich UI/UX effects.
- Lucide icons for consistent interface symbols.

## How It Works

```text
User Description
       │
       ▼
React / TypeScript Interface
       │
       ▼
Express API — POST /api/generate-agent
       │
       ▼
Google Gemini Structured Generation
       │
       ▼
Voice Agent Configuration
       │
       ├── Local agent saved to data/agents.json
       │
       └── ElevenLabs deployment request
               │
               ▼
        Signed browser session
               │
               ▼
        Live voice conversation
```

A typical workflow is:

1. Enter a description for the desired voice agent.
2. Add optional role, tone, language, and voice preferences.
3. Submit the description to the Gemini-backed generation endpoint.
4. Review the generated persona, prompt, voice, and test questions.
5. Save or deploy the agent.
6. Start a signed live conversation session for browser testing.

## Technology Stack

| Area | Technology |
| :--- | :--- |
| Frontend framework | React 19 |
| Build system | Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Server | Express 4 |
| AI generation | Google Gemini through `@google/genai` |
| Voice platform | ElevenLabs Conversational AI and SDK |
| 3D / graphics | Three.js and React Three Fiber |
| Animation | Motion |
| Icons | Lucide React |
| Runtime tooling | Node.js, `tsx` |
| Local persistence | JSON files under `data/` |

## Project Structure

```text
VoiceForgeAI/
├── components/             # Shared application components
├── data/                   # Local JSON storage for agents and sessions
├── lib/                    # Shared utilities
├── public/                 # Static public assets
├── src/
│   ├── components/         # React UI components
│   ├── lib/                # Frontend helpers
│   ├── services/           # API and service integrations
│   ├── types/              # TypeScript models and interfaces
│   ├── App.tsx             # Main application component
│   ├── index.css           # Global styles
│   └── main.tsx            # React entry point
├── .env.example            # Example API environment variables
├── components.json         # Component configuration
├── index.html              # HTML entry document
├── package.json            # Scripts and dependencies
├── server.ts               # Express server and API routes
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite and Tailwind configuration
```

## Prerequisites

Before running VoiceForgeAI, install:

- [Node.js](https://nodejs.org/) 20 or newer is recommended;
- [npm](https://www.npmjs.com/) or Bun for package management;
- a Google Gemini API key for AI-assisted generation; and
- an ElevenLabs API key for real voice lookup, deployment, and live sessions.

Curated voice data can be displayed without an ElevenLabs key, but live voice-agent operations require one.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/priyansh019/VoiceForgeAI.git
cd VoiceForgeAI
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using Bun:

```bash
bun install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then add valid API keys as described below.

## Environment Configuration

Create a `.env` file in the repository root:

```dotenv
GEMINI_API_KEY="your_gemini_api_key_here"
ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"
```

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | For AI generation | Generates structured voice-agent personas and prompts |
| `ELEVENLABS_API_KEY` | For live voice operations | Lists voices, deploys agents, and creates signed sessions |

Never commit real API keys. Keep `.env` private and rotate keys if they are exposed.

## Running the Application

Start the development server:

```bash
npm run dev
```

The application uses the Express server in `server.ts` and Vite middleware for the frontend.

Open:

```text
http://localhost:3000
```

The default server port is `3000`.

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Express with Vite development middleware |
| `npm run start` | Starts `server.ts` directly with Node.js |
| `npm run build` | Creates an optimized production build in `dist/` |
| `npm run preview` | Preview a production build with Vite |
| `npm run lint` | Runs TypeScript type-checking without emitting files |
| `npm run clean` | Removes `dist/` and generated `server.js` |

## API Overview

The backend exposes the following primary route groups:

### Status and Voices

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Reports Gemini and ElevenLabs configuration status |
| `GET` | `/api/voices` | Lists curated or API-fetched ElevenLabs voices |

### Agent Generation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate-agent` | Generates a structured agent configuration with Gemini |

### ElevenLabs Integration

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/elevenlabs/agent` | Creates or updates a deployed ElevenLabs agent |
| `POST` | `/api/elevenlabs/session` | Creates a signed URL for a live browser session |

### Local Agent and Session CRUD

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/agents` | Retrieves locally saved agents |
| `POST` | `/api/agents` | Creates or updates a local agent |
| `DELETE` | `/api/agents/:id` | Deletes a local agent |
| `GET` | `/api/sessions` | Retrieves locally saved sessions |
| `POST` | `/api/sessions` | Saves a session record |

## Local Data Storage

The server creates the `data/` directory automatically and stores:

| File | Content |
| :--- | :--- |
| `data/agents.json` | Locally persisted generated and deployed agents |
| `data/sessions.json` | Local voice or testing session history |

The application uses an intentionally lightweight JSON store, making setup easy for local demonstrations. For multi-user or production use, replace these files with a database and add authentication and migrations.

## Supported Languages and Voices

VoiceForgeAI is designed for natural spoken conversations. It includes special guidance for:

- English;
- Natural Indian Hindi;
- Hinglish; and
- Mixed Hindi and English conversations.

Curated default voices include Rachel, Jessica, George, Daniel, Sarah, and Charlie. When configured, the ElevenLabs API can provide additional voices and Hindi-filtered results.

## Production Build

Create and run a production build:

```bash
npm run build
NODE_ENV=production npm run start
```

The Express server first checks for a `dist/` directory. If found, it serves the compiled Vite application and falls back to `index.html` for SPA routes.

## Troubleshooting

### `GEMINI_API_KEY is not configured`

- Confirm `.env` exists in the project root.
- Confirm `GEMINI_API_KEY` contains a valid key.
- Restart the development server after changing environment variables.

### Curated voices appear instead of API voices

- Add `ELEVENLABS_API_KEY` to `.env`.
- Restart the server.
- Call `GET /api/status` to inspect API configuration.

### ElevenLabs API errors

- Verify that the key has the required permissions.
- Confirm the selected voice ID exists.
- Check ElevenLabs account limits and credits.
- Review server logs for the upstream response.

### A live session cannot start

- Confirm that the agent is deployed successfully.
- Confirm that an ElevenLabs agent ID has been stored locally.
- Add a valid ElevenLabs key and request a fresh signed session URL.

### Development server changes do not appear

- Ensure Vite middleware is running.
- Restart `npm run dev` after dependency or configuration changes.
- Check whether `DISABLE_HMR=true` is set in the environment.

## Security and Privacy

- API keys should remain server-side in environment variables.
- Do not expose keys through `VITE_*` variables or client-side source code.
- Agent prompts and session data are stored locally in JSON files.
- Add authentication before exposing the server publicly.
- Add rate limiting and request validation before production deployment.
- Review ElevenLabs and Gemini privacy policies for cloud-based content processing.
- Avoid storing sensitive personal or confidential information in agent prompts or session history.

## Roadmap

Possible improvements for a production-ready release include:

- database-backed persistence;
- user authentication and multi-user workspaces;
- role-based access control;
- agent templates and marketplace features;
- persistent analytics and call transcripts;
- automated agent evaluation;
- Docker deployment;
- CI/CD workflows;
- automated tests;
- observability and structured logging; and
- cloud object storage for recordings and assets.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes and run type-checking:

   ```bash
   npm run lint
   ```

4. Test the development server and relevant API routes.
5. Commit and push your branch.
6. Open a pull request with a clear description, screenshots when useful, and testing notes.

## License

No license is currently specified. A license should be added before the project is reused or redistributed outside personal or educational use.

---

<p align="center">Built as a hackathon prototype for creating and testing AI-powered conversational voice agents.</p>
