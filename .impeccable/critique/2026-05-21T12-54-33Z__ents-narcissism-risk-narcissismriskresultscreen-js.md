---
target: components/narcissism-risk/NarcissismRiskResultScreen.js
total_score: 23
p0_count: 0
p1_count: 4
timestamp: 2026-05-21T12-54-33Z
slug: ents-narcissism-risk-narcissismriskresultscreen-js
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---:|---:|---|
| 1 | Visibility of System Status | 3 | Submit/export states exist, but the result state is visually dense and hard to triage. |
| 2 | Match System / Real World | 3 | Tone is professional and bounded; several metrics still feel system-facing rather than user-facing. |
| 3 | User Control and Freedom | 2 | Restart and modal close exist, but there is no clear section navigation or recovery path inside the result page. |
| 4 | Consistency and Standards | 2 | Core page is neutral, but exported result hard-codes “Sandra 婚姻家事团队,” weakening platform neutrality. |
| 5 | Error Prevention | 3 | Service intent, contact validation, submit lock, and inline errors are solid. |
| 6 | Recognition Rather Than Recall | 2 | Users must infer which metric matters and what action should follow from the risk result. |
| 7 | Flexibility and Efficiency of Use | 1 | Mostly one linear path; acceptable for a self-assessment, but there is little support for return users or quick action. |
| 8 | Aesthetic and Minimalist Design | 2 | Too many equal-weight panels, metric tiles, nested surfaces, and long text blocks. |
| 9 | Error Recovery | 3 | Field-level errors are clear and recoverable; submit failure copy gives a fallback. |
| 10 | Help and Documentation | 2 | Boundary/disclaimer guidance exists, but contextual help for score meaning and service choice is thin. |
| **Total** | | **23/40** | **Acceptable, significant refinement needed** |

#### Anti-Patterns Verdict

**Does it look AI-generated?** Not in the loud obvious way. It avoids purple gradients, glassmorphism, entertainment-test cues, and overt law-firm conversion language. The stronger risk is product-template slop: large hero, pill label, badge, five metric tiles, white rounded cards, long explanatory paragraphs, and a generic lead form. It feels like a competent MVP result dashboard rather than a calm high-value consultation artifact.

**LLM assessment:** The strongest mismatch is hierarchy. The page asks a stressed user to process result label, long result copy, five metrics, high-risk safety guidance, radar explanation, export action, and contact form before establishing a confident “what this means and what to do next” path. The form logic is respectful, but the visual model still resembles a lead-capture panel.

**Deterministic scan:** Assessment B ran `node .agents/skills/impeccable/scripts/detect.mjs --json components/narcissism-risk/NarcissismRiskResultScreen.js` and a related non-CSS component scan under `components/narcissism-risk`; both exited `0` with `[]` findings. No detector rule IDs or file locations were reported. This clean detector result is not proof of strong design; it only means the bundled anti-pattern rules found no deterministic violations.

**Visual overlays:** Overlay injection was not completed by Assessment B. No reliable user-visible Impeccable overlay exists. Parent-process Playwright fallback captured the required visual states as evidence instead.

#### Overall Impression

The result page is functionally stable and responsibly worded, but visually it still reads as a dense result dashboard. The biggest opportunity is to turn the first screen from “report plus metrics” into a guided professional handoff: result, meaning, safety priority, next support choice.

#### What's Working

1. Professional boundaries are strong. Copy avoids diagnosing NPD, avoids legal overclaiming, and keeps safety advice grounded.
2. Lead capture logic is respectful. There is no default service intent, validation is inline, submit is locked during async work, and success modals differ by selected service path.
3. Risk messaging is serious without being alarmist. The high-risk alert uses restrained wording and explicitly avoids legal/medical定性.

#### Priority Issues

**[P1] Result first screen is too report-like for a stressed user**

Why it matters: Users in conflict may not be able to interpret five metrics plus a long summary. The first screen should answer: what level am I in, what risk matters most, what should I do next.

Fix: Reframe Hero around three layers: result label, plain-language meaning, recommended next step. Move secondary metrics into a quieter details row or later measurement-details section.

Suggested command: `$impeccable layout` focused on `NarcissismRiskResultScreen.js` Hero + metrics.

**[P1] High-risk safety and result visuals compete instead of sequence**

Why it matters: In high-risk state, both Hero and safety alert use similar pale red surfaces and strong borders. The user sees repeated danger surfaces instead of a clear escalation path.

Fix: Use a restrained Hero with only small red-brown semantic markers, then make the safety alert the single dedicated red-brown safety surface. Split the safety card into “signal,” “immediate action,” and “boundary” text regions without making a three-column marketing block.

Suggested command: `$impeccable layout` focused on result Hero and safety alert.

**[P1] Lead panel mixes reassurance, triage, and form work**

Why it matters: The “获取后续支持” panel asks users to read a long paragraph, choose a support intent, provide contact information, and understand submission expectations at once.

Fix: Shorten the opening reassurance, make the three service intentions scannable and equal, then subordinate contact fields. Keep default “请选择” and existing `service_intent` values.

Suggested command: `$impeccable layout` or `$impeccable polish` focused on `NarcissismRiskLeadCapturePanel.js`.

**[P1] Neutral platform promise is broken by exported result branding**

Why it matters: `NarcissismRiskSimpleResultExportCard.js` hard-codes “Sandra 婚姻家事团队,” which conflicts with PRODUCT.md and DESIGN.md’s neutral cooperation platform requirement.

Fix: Replace hard-coded single-team branding with neutral product wording or a configurable partner-brand slot. Treat this separately because it touches PNG export output.

Suggested command: `$impeccable polish` focused on PNG export card branding only.

**[P2] Visual system leans generic card-dashboard**

Why it matters: White cards inside white frames, 22-28px rounded panels, soft shadows, and repeated metric/legend cards make the page feel assembled rather than directed.

Fix: Reduce nested surfaces, lower routine radii toward the design system’s 8-12px range, use borders and spacing over shadows, and let typography carry hierarchy.

Suggested command: `$impeccable layout` followed by `$impeccable polish`.

**[P2] Accessibility risks remain in modal/chart states**

Why it matters: The modal has dialog roles, but focus trap/Esc behavior was not confirmed. The radar chart is visually clear but still depends heavily on shape unless the adjacent text summary is treated as equivalent data.

Fix: Verify modal focus management and keyboard dismissal in a later audit/harden pass. Keep textual dimension summary visible and useful.

Suggested command: `$impeccable audit` or `$impeccable harden` after visual layout work.

#### Persona Red Flags

**Jordan, first-time stressed user:** The page explains a lot, but the result metrics are not sequenced around Jordan’s immediate question: “What does this mean for me now?” “总分 / 动态满分” and “有效作答” are useful, but too prominent for first understanding.

**Sam, accessibility-dependent user:** Form labels and errors are mostly good. Red flags are the SVG radar’s reliance on visual shape, possible modal focus gaps, and disabled button contrast due to global opacity.

**Casey, distracted mobile user:** At 390px, the first screen becomes long: Hero, five metric blocks, safety alert, radar chart, then support form. The support action lands far below the risk message, and the disabled primary button is a large gray block before the user has selected intent.

#### Minor Observations

- Button hover uses `translateY(-1px)`, creating small positional movement where the design system prefers state changes without layout shift.
- `backgroundColor: "#ffffff"` in PNG export conflicts with the near-white/tinted-neutral direction, though export constraints may justify a stable white background.
- Error copy is clear, but name validation may reject real names with uncommon punctuation or non-Chinese/non-English scripts.
- One browser console error appeared during desktop capture: `Failed to load resource: the server responded with a status of 404 (Not Found)`. It should be checked later, but it did not block evidence capture.
- The disclaimer is placed correctly but still visually similar to a primary content card; it should be readable but lower-weight.

#### Questions to Consider

- What if the first screen answered only three questions: “What level am I in?”, “What is the main risk?”, “What should I do next?”
- Are all five metric tiles truly for the user, or are some for professionals/back office?
- Should high-risk users see the support path before the radar chart, or should safety guidance remain the immediate next block?
- If this must feel like a neutral cooperation platform, why does the exported result name a specific team?

#### Evidence Summary

Sub-agent Assessment A visually inspected the intro page and reviewed result source/CSS, but did not complete live result evidence. Sub-agent Assessment B completed deterministic detector scans but failed browser-state capture before interruption. Parent fallback captured the required real states via localhost Playwright using Supabase request interception for success modals, with no real database write.

Captured states:
- high-risk result desktop
- high-risk result 390px mobile
- form default
- form error
- `legal_support` modal
- `psychological_support` modal
- `deep_report` QR modal
- high-risk alert
- radar chart area
- lead form area
