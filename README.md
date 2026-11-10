# 🚀 Gillette Pitch Engine — AI Startup Evaluator & Problem-Solving System

A production-grade, full-stack AI application designed to evaluate, de-risk, and optimize startup pitches. Built on **React 19**, **TypeScript**, **Tailwind CSS v4**, **Node.js/Express**, and **Google Gemini AI**, the **Gillette Pitch Engine** combines deterministic mathematical decision algorithms with AI-driven venture analysis.

---

## 🌟 Key Modules & Capabilities

### 1. 💬 Pitch Intake & Interactive Studio
- **Drop-down Stage & Mandatory Field Validation**: Input startup ideas with validation, smooth tactile feedback, and interactive stage select.
- **Instant Venture Analysis**: Automatically derives positioning taglines, industry classification, and readiness scores.

### 2. 🕸️ Causal Problem Mapping System (Interactive DAG)
- **Multi-Tier Problem Relationships**: Separates problems into **Root Causes** (Red), **Intermediate Problems** (Orange), and **Downstream Symptoms** (Yellow).
- **Interactive Graph Canvas**: Supports pan, zoom, custom node dragging, and branch expansion/collaboration.
- **Causal Path Tracing**: Trace upstream root causes or downstream ripple effects with one click.
- **Node Inspection Panel**: Deep breakdown of mechanism failure, why friction occurs, supporting evidence vs. AI hypotheses, founder assumptions, and concrete next actions.

### 3. 🛡️ 6-Pillar Venture Gap Audit
- **Comprehensive Due Diligence**: Evaluates vulnerabilities across **TAM & Market**, **Technical Viability**, **Unit Economics**, **Distribution & GTM**, **Legal & Regulatory**, and **Competitive Moat**.
- **Severity-Themed Cards**: Dynamic pastel color gradients reflecting risk level (Low, Moderate, High Severity).
- **3D Convex Glass Expo Tiles**: Specular glare lens reflections and tactile drop shadow depth.

### 4. 🎛️ TOPSIS Multi-Criteria Decision Studio
- **Deterministic Algorithmic Ranking**: Uses the **Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS)** to rank candidate solutions based on Euclidean distance to Ideal Best ($A^+$) and Ideal Worst ($A^-$).
- **Interactive Weight Sliders**: Real-time slider controls adjusting criteria weights (**Feasibility**, **Cost Efficiency**, **Market Impact**, **Scalability**, **Speed-to-Market**).
- **Preset Strategies**: Instant toggle between Growth, Lean, Speed, and Equal weighting presets.

### 5. ❓ Adaptive Information-Entropy Q&A Engine
- **Uncertainty Reduction**: Ranks clarification questions based on information entropy and severity to resolve key founder assumptions.
- **Quick-Choice Options**: One-click quick answer suggestions or custom input.

### 6. 👥 6-Persona AI Reviewer Council & 1-on-1 Chat
- **Diverse Expert Perspectives**: Evaluates pitches through 6 distinct personas:
  - 💼 **VC Partner**
  - 👤 **ICP Target Customer**
  - ⚙️ **Chief Technology Architect**
  - ⚖️ **Healthcare / Regulatory Lawyer**
  - 📊 **Financial & Unit Economics Analyst**
  - 🎯 **Product Builder & Judge**
- **Live 1-on-1 Persona Sparring**: Direct interactive chat with individual judges powered by Gemini reasoning.

### 7. 🔄 Pitch Evolution & V2 Diff Engine
- **Side-by-Side Version Comparison**: Track pitch iterations from raw draft (V1) to de-risked proposal (V2+).
- **Audit Log**: Highlights resolved gaps, remaining risks, and readiness score gains.

### 8. 📊 Executive Pitch Deck Exporter
- **Native PowerPoint Generation**: Generates 10-slide PowerPoint presentations (`.pptx`) using `pptxgenjs`.
- **Multiple Executive Themes**: Download presentation decks in Executive Dark, Clean Light, Midnight Navy, or Minimalist themes.

### 9. 📐 Algorithmic Transparency Console
- **Interactive Math Inspector**: View exact mathematical formulas, LaTeX equations, and matrix computations powering TOPSIS, DAG Centrality, and Information Entropy.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React |
| **Backend** | Node.js, Express, TSX (Full-Stack Dev Server) |
| **AI SDK** | `@google/genai` TypeScript SDK (Google Gemini Models) |
| **Presentation Export** | `pptxgenjs` (Native PPTX Compiler) |
| **Build & Tooling** | Vite, TypeScript, ESLint |

---

## 📁 Repository Structure

```
.
├── server.ts                   # Express full-stack server & Vite middleware
├── package.json                # Project dependencies and npm scripts
├── vite.config.ts              # Vite bundle configuration
├── index.html                  # Main HTML entry point
├── src/
│   ├── App.tsx                 # Main application container & state router
│   ├── main.tsx                # Client DOM mount entry point
│   ├── index.css               # Global Tailwind CSS imports & theme rules
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & domain models
│   ├── components/
│   │   ├── Header.tsx          # Top bar with Drive search pill & toolbar
│   │   ├── SidebarNavigation.tsx# Curved royal blue side navigation drawer
│   │   ├── ApiKeyModal.tsx     # Custom Gemini API key & quota manager
│   │   ├── WakeSlider.tsx      # Custom tactile slider control
│   │   ├── modals/
│   │   │   └── AlgorithmInspectionModal.tsx # TeX math inspector modal
│   │   └── views/
│   │       ├── IdeaIntakeView.tsx           # Pitch intake & readiness dashboard
│   │       ├── ProblemDecompositionView.tsx # Interactive Causal DAG graph
│   │       ├── GapDetectionView.tsx         # 6-Pillar gap audit cards & details
│   │       ├── TopsisStudioView.tsx         # TOPSIS decision studio & sliders
│   │       ├── AdaptiveQuestionView.tsx     # Information-entropy Q&A module
│   │       ├── MultiAgentCouncilView.tsx    # 6-persona council & 1-on-1 chat
│   │       ├── DynamicImprovementView.tsx   # Version diff & pitch synthesizer
│   │       └── PitchDeckExportView.tsx      # PPTX slide deck compiler & preview
│   └── server/
│       ├── api.ts              # Express REST API endpoints
│       ├── gemini.ts           # Gemini AI integration layer
│       ├── pptxGenerator.ts    # Native PowerPoint slide deck builder
│       └── algorithms/
│           ├── topsis.ts       # Deterministic TOPSIS decision algorithm
│           ├── graph.ts        # Directed Acyclic Graph & cycle detector
│           ├── consensus.ts    # Agent variance & consensus analyzer
│           ├── adaptiveScheduler.ts # Entropy Q&A scheduler
│           ├── diffEngine.ts   # Pitch iteration comparison engine
│           └── testRunner.ts   # Algorithm verification test suite
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/gillette-pitch-engine.git
   cd gillette-pitch-engine
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: Users can also enter their custom API key directly in the app UI if quota is reached).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📜 Available Scripts

- `npm run dev` — Starts the Express full-stack server with Vite HMR on port 3000.
- `npm run build` — Compiles production-ready frontend bundle into `dist/`.
- `npm run start` — Starts the production Node server.
- `npm run lint` — Validates TypeScript types and syntax.

---

## 📄 License

This project is open source and available under the **MIT License**.
