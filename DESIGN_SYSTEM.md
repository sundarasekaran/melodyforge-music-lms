# MelodyForge Design System
## Version 1.0.0 — Production Specifications

The MelodyForge Design System provides the visual guidelines, design tokens, component standards, and accessibility criteria for the Gamified Multi-Instrument Music Learning Management System.

---

### 1. Design Philosophy

1. **Acoustic Warmth meets Modern Precision**: Deep obsidian/charcoal surfaces with glowing amber and rich indigo highlights simulate the elegance of a concert hall with the precision of a digital audio workstation.
2. **Pedagogical Clarity**: High visual hierarchy, distraction-free reading environments for theory, and tactile, high-feedback interaction for virtual instruments and ear training.
3. **Motivating Gamification**: XP counters, streak flames, and mastery badges are integrated seamlessly without feeling childlike or noisy.
4. **Universal Accessibility**: WCAG 2.1 AA compliant color contrast, visible focus outlines, keyboard navigability, and multi-device responsiveness.

---

### 2. Design Tokens

#### A. Color Palette

```
/* Base Surfaces */
--bg-app:         #080C14;  /* Deepest midnight backdrop */
--bg-surface:     #0F172A;  /* Main card & container background */
--bg-elevated:    #1E293B;  /* Elevated surface (modals, dropdowns, hovered cards) */
--bg-highlight:   #334155;  /* Active item highlight */

/* Borders & Dividers */
--border-subtle:  #1E293B;  /* Barely visible structural separator */
--border-default: #334155;  /* Standard card & input border */
--border-focus:   #6366F1;  /* Focus ring & active border */

/* Text Hierarchy */
--text-primary:   #F8FAFC;  /* 98% white high-contrast body & headings */
--text-secondary: #94A3B8;  /* Subheadings & descriptive body */
--text-muted:     #64748B;  /* Metadata, captions, disabled text */
--text-gold:      #F59E0B;  /* Achievement & XP highlight text */

/* Accents */
--accent-gold:    #F59E0B;  /* Primary mastery & streak flame */
--accent-gold-dark:#D97706; /* Hover / active state for gold */
--accent-indigo:  #6366F1;  /* Music theory & interactive audio core */
--accent-indigo-dark:#4F46E5;/* Deep indigo for buttons */

/* Semantic States */
--state-success:  #10B981;  /* Correct note / completed lesson */
--state-warning:  #F59E0B;  /* Approaching goal / milestone */
--state-error:    #EF4444;  /* Incorrect note / destructive action */
--state-info:     #0EA5E9;  /* Helpful tips & tutorial cues */
```

#### B. Typography Scale

* **Font Family**: `Inter, system-ui, -apple-system, sans-serif`
* **Monospace**: `ui-monospace, SFMono-Regular, Menlo, monospace` (for keybindings, timers, pitch frequencies)

| Token | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-display` | 32px (2rem) | 1.2 | Extrabold (800) | Hero greetings, level-up celebration |
| `text-h1` | 24px (1.5rem) | 1.3 | Bold (700) | Major page titles (Dashboard, Roadmap) |
| `text-h2` | 20px (1.25rem) | 1.35 | Bold (700) | Section headers, card group titles |
| `text-h3` | 16px (1rem) | 1.4 | SemiBold (600) | Sub-sections, modal headers |
| `text-body` | 14px (0.875rem) | 1.5 | Regular (400) / Medium (500) | Primary interface copy, theory text |
| `text-caption` | 12px (0.75rem) | 1.4 | Medium (500) | Badges, labels, timestamp, hotkeys |
| `text-micro` | 10px (0.625rem) | 1.3 | Bold (700) | Tags, uppercase category pills |

#### C. Spacing & Corner Radii

* **Spacing Grid**: 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)
* **Corner Radii**:
  - `rounded-sm`: 6px (Micro badges, key caps)
  - `rounded-md`: 10px (Inputs, toolbars, small buttons)
  - `rounded-lg`: 14px (Standard buttons, dropdowns)
  - `rounded-xl`: 18px (Standard cards, exercise boxes)
  - `rounded-2xl`: 24px (Modal dialogs, major dashboard containers)
  - `rounded-full`: 9999px (Avatar, pills, streak circles)

#### D. Elevation & Shadows

* **Surface 1 (Cards)**: `0 4px 20px -2px rgba(0, 0, 0, 0.4)`
* **Surface 2 (Modals/Flyouts)**: `0 20px 40px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)`
* **Glow Accents**:
  - Gold: `0 0 25px -5px rgba(245, 158, 11, 0.25)`
  - Indigo: `0 0 25px -5px rgba(99, 102, 241, 0.25)`

---

### 3. Reusable UI Components

The design system incorporates the following centralized component primitives in `frontend/src/components/ui/`:

1. **Button**: Primary (Indigo / Amber), Secondary (Slate Elevated), Outline, Ghost, Danger, with support for icons, loading spinner, and keyboard focus rings.
2. **Card**: Elevated, Bordered, Interactive hover effects, with `CardHeader`, `CardContent`, and `CardFooter`.
3. **StatCard**: Metric label, dynamic primary value, visual trend badge, and icon pill.
4. **Badge**: Status indicators (Active, In Review, Locked), Level badges, XP tags, and Lesson Type tags.
5. **ProgressBar & ProgressRing**: Smooth animated progress indicators with percentage labels.
6. **Modal & Dialog**: Accessible dialog backdrop with escape-key listeners, focus trapping, header, and action buttons.
7. **Tabs**: Accessible tab list and panel switcher for segmented controls.
8. **EmptyState & ErrorState**: Structured empty/error screens with illustrations and recovery actions.
9. **PageHeader & SectionHeader**: Unified page titles, subtitle, breadcrumbs, and right-aligned action buttons.

---

### 4. Interactive Instrument & Audio Guidelines

* **Virtual Piano**:
  - White keys: High-contrast ivory with beveled bottom edges and realistic downward translation (`translateY(2px)`) when struck.
  - Black keys: Matte obsidian with glossy upper reflection and distinctive depth.
  - Active key highlights: Soft glowing ring and clear note identifier.
* **Staff Notation**:
  - SVG Grand Staff / Treble Staff with proportional line spacing.
  - Clear Middle C (C4) ledger lines.
  - Stem direction: Up for notes below Middle B (B4), Down for notes on or above B4.
* **Recording Indicators**:
  - Unmistakable pulsating red indicator during live recording.
  - Timer displayed in high-legibility monospace numerals.
