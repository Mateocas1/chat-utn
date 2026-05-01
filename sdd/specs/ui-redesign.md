# Spec: chat-frontend-ui-redesign

Design direction: **Alt A — Industrial Quiet** (Zinc neutrals, single Emerald accent, status-first, no glow).

## ui-design-system

### Requirement: Design Tokens
System SHALL define CSS-first `@theme` tokens using OKLCH color space. Palette: Zinc neutrals (50–950), single Emerald accent (400–600), semantic status colors (success/warning/error). Radii, spacing, focus-ring (2px Emerald, 2px offset), and motion duration/easing scales. Dark mode via Tailwind v4 `@variant dark` with adjusted OKLCH lightness. No glow, no gradient, no pure black (`#000000`).

#### Scenario: Dark mode token resolution
- GIVEN `@variant dark` is active
- WHEN tokens resolve
- THEN all colors shift to dark-optimized OKLCH values; Emerald accent remains singular

### Requirement: Component Variants
MUST provide CVA-based variants for Button, Input, Dialog, Toast, Badge, Avatar. Variants: `default` (Zinc), `accent` (Emerald-500 bg, Zinc-950 text), `danger`, `ghost`. No box-shadow glow. Focus rings: 2px Emerald with 2px offset.

#### Scenario: Accent variant rendering
- GIVEN component with variant="accent"
- WHEN rendered
- THEN Emerald-500 background, Zinc-950 text, no glow effect

---

## chat-realtime-ux

### Requirement: Socket.IO Connection Lifecycle
MUST display connection state: `connected` (no indicator), `connecting` (Zinc-400 pulse), `disconnected` (Emerald→Zinc-400 icon shift + "Reconnecting…" label). Auto-reconnect with exponential backoff. No page refresh required to resume.

#### Scenario: Connection drop and recovery
- GIVEN active Socket.IO connection
- WHEN connection drops
- THEN "Reconnecting…" label appears within 500ms
- AND on reconnect, label clears and missed messages stream in

### Requirement: Optimistic Message Send
MUST render sent messages immediately as `pending` (Zinc-400 timestamp). On server ACK → `delivered` (Zinc-600 timestamp). On failure → error icon with retry affordance.

#### Scenario: Send failure and retry
- GIVEN user sends a message
- WHEN server rejects or times out
- THEN message shows error icon with retry action

### Requirement: Typing Indicators
MUST display typing in chat list (Emerald dot pulse beside thread name) and active thread ("User is typing…" label). Appear within 200ms of Socket.IO event. Expire after 3s inactivity.

#### Scenario: Dual typing display
- GIVEN another user types in thread X
- WHEN typing event received
- THEN chat list shows dot pulse beside X; active thread shows "User is typing…"

---

## notifications-ux

### Requirement: In-App Toasts
MUST render toasts for: messages in non-active threads, mentions, system events. `accent` variant for mentions, `default` for messages. Auto-dismiss after 5s. Stack newest-on-top.

#### Scenario: Mention toast
- GIVEN user mentioned in non-active thread
- WHEN mention event arrives
- THEN accent-styled toast with sender + preview; auto-dismisses 5s

### Requirement: Web Push Permission Flow
MUST request push only on explicit opt-in (never on page load). Flow: rationale dialog → `Notification.requestPermission()` → send subscription to backend. Settings panel: per-thread push toggle + quiet hours.

#### Scenario: Push opt-in
- GIVEN user clicks "Enable notifications"
- THEN rationale dialog appears → browser prompt → on grant, subscription sent to backend

#### Scenario: Quiet hours suppression
- GIVEN quiet hours configured (e.g., 22:00–07:00)
- WHEN push event occurs during quiet hours
- THEN no push notification delivered

---

## accessibility-chat-ui

### Requirement: WCAG AA Compliance
MUST meet WCAG 2.1 AA: 4.5:1 text contrast, 3:1 UI component contrast. Focus indicators: 2px Emerald ring, 2px offset. All interactive elements keyboard-operable.

#### Scenario: Contrast audit
- GIVEN rendered UI
- WHEN WCAG AA audit runs
- THEN all text ≥4.5:1, all UI components ≥3:1

### Requirement: Roving Tabindex in Chat List
Chat list MUST implement roving tabindex: ArrowUp/Down moves focus, Enter activates, Home/End jump to first/last. Focus wraps at boundaries.

#### Scenario: Keyboard navigation
- GIVEN focus on thread N
- WHEN ArrowDown pressed
- THEN focus moves to thread N+1; tabindex updates

### Requirement: Screen Reader Semantics
Thread container: `role="log"`. Messages: `role="article"`. New messages: `aria-live="polite"`. Send button: `aria-label="Send message"`.

#### Scenario: SR message announcement
- GIVEN screen reader active
- WHEN new message arrives in active thread
- THEN content announced via aria-live

### Requirement: Reduced Motion
MUST respect `prefers-reduced-motion`: disable animations or reduce to opacity-only. Typing indicators show static text ("User is typing…") instead of animation.

#### Scenario: Reduced motion preference
- GIVEN `prefers-reduced-motion: reduce`
- WHEN UI renders
- THEN animations suppressed; typing shows static text
