# Cognition — Interactive JSON-Based Learning Platform

An educational web platform built with React, TypeScript, Tailwind CSS, Lucide icons, Three.js, and React Markdown. Every learning subject is defined by an isolated local JSON file and automatically discovered without modifying any components, routing tables, or topic registries.

---

## 🌟 Key Features

1. **JSON-Driven Content Architecture:**
   - Drop a new JSON file into `src/data/topics/<slug>.json` to automatically discover and render a new topic at `/topics/<slug>`.
   - Strictly validated using **Zod** for schema safety (headings, question-answer pairs, optional markdown content).

2. **Interactive Q&A Cards:**
   - Questions start with answers hidden.
   - Click the eye icon button (`Eye` / `EyeOff`) on any card to reveal or hide its answer.
   - Global **Show All Answers / Hide All Answers** toggle with live state tracking.
   - Individual question counter and study progress meter.
   - Fully keyboard accessible (`aria-expanded`, `aria-controls`, visible focus outlines).

3. **Markdown-Based Study Notes:**
   - Rendered strictly **after the entire Q&A section**.
   - Full GitHub Flavored Markdown (GFM) support via `react-markdown` and `remark-gfm`: tables, lists, blockquotes, syntax-highlighted code blocks, and callouts.
   - If a topic has no markdown content, the section is omitted without empty whitespace.

4. **Three.js 3D Visual Experience:**
   - Homepage hero features a rotating geometric knot with orbiting satellite shapes and a floating particle field.
   - Each topic page renders a procedural 3D visual header derived from the topic title/slug (crystallography for grammar, interlocking rings for idioms, planetary orbital system for science, nodal lattice for computing).
   - Graceful WebGL fallback and respect for `prefers-reduced-motion`.

5. **Universal Light & Dark Mode:**
   - Cohesive theme toggle synchronized across cards, typography, markdown tables, and Three.js lighting.

---

## 📂 Project Structure

```text
src/
├── types/
│   └── topic.ts                 # TypeScript interfaces for topics & questions
├── lib/
│   ├── topic-schema.ts          # Zod validation schema
│   ├── topics.ts                # Automatic JSON discovery & loader utility
│   └── theme-context.tsx        # Light/dark theme provider
├── data/
│   └── topics/                  # Topic JSON storage (drop new files here!)
│       ├── preposition.json
│       ├── parts-of-speech.json
│       ├── idioms.json
│       ├── computer-science.json
│       └── solar-system.json
├── components/
│   ├── layout/
│   │   ├── header.tsx           # Sticky nav, topic selector & theme switch
│   │   └── footer.tsx           # Educational directory & quick links
│   ├── topics/
│   │   ├── homepage.tsx         # Dashboard hero & searchable topic grid
│   │   ├── topic-card.tsx       # Reusable topic card with question count
│   │   └── topic-page.tsx       # Reusable topic layout (Breadcrumb -> Hero -> Q&A -> Markdown)
│   ├── questions/
│   │   ├── question-card.tsx    # Interactive eye-toggle Q&A card
│   │   └── question-list.tsx    # List with Show All / Hide All controls
│   ├── markdown/
│   │   └── markdown-content.tsx # GFM study notes renderer
│   ├── three/
│   │   ├── scene-wrapper.tsx    # WebGL capability detector & graceful fallback
│   │   ├── background-scene.tsx # 3D Hero geometry scene
│   │   └── topic-visual.tsx     # Context-aware 3D topic sculpture
│   └── ui/
│       ├── button.tsx           # Reusable button primitive
│       ├── search-input.tsx     # Instant topic search bar
│       ├── empty-state.tsx      # Zero-state indicator
│       └── not-found.tsx        # 404 topic not found page
├── App.tsx                      # Root application & client router
└── index.css                    # Tailwind CSS v4 styling & typography
```

---

## 📝 How to Add a New Topic

To add a new learning topic, simply create a `.json` file in `src/data/topics/`. For example, create `src/data/topics/conditional-sentences.json`:

```json
{
  "heading": "Conditional Sentences",
  "subheading": "Expressing hypothetical situations and consequences in English",
  "items": [
    {
      "question": "What is the Zero Conditional?",
      "answer": "Used for universal facts and truths. Structure: If + present simple, present simple. Example: If water reaches 100°C, it boils."
    },
    {
      "question": "What is the First Conditional?",
      "answer": "Used for real or likely future situations. Structure: If + present simple, will + base verb. Example: If it rains tomorrow, we will stay home."
    }
  ],
  "content": "## Summary of Conditional Types\n\n| Type | If-Clause | Main Clause | Usage |\n|---|---|---|---|\n| Zero | Present Simple | Present Simple | Scientific facts |\n| First | Present Simple | Will + Base Verb | Likely future |\n| Second | Past Simple | Would + Base Verb | Hypothetical present |\n| Third | Past Perfect | Would have + V3 | Past regrets |\n\n> **Tip:** Remember that conditional sentences can reverse clause order without changing meaning."
}
```

The application automatically registers this file and exposes `/topics/conditional-sentences` on the homepage and navigation.

---

## 🚀 Development & Build

### Prerequisites
Node.js 18+ and npm installed.

### Installation
```bash
npm install
```

### Run in Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
```

### Static Preview
```bash
npm run preview
```
