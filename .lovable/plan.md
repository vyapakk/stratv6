

## Bug: Inconsistent Hero Section Alignment

### Problem
The "Wrong" screenshot shows the hero text and stats centered on desktop, while "Fine" shows the correct layout (text left, stats right). The root cause is reliance on `text-center md:text-left` and `mx-auto md:mx-0` which can behave inconsistently across browsers — especially when combined with the `container` class (which has `center: true` and `padding: 2rem` in Tailwind config) and `px-0` override.

### Root Causes
1. `text-center md:text-left` on the text wrapper — `text-align` inheritance can be unreliable across browsers with flexbox children
2. `mx-auto md:mx-0` on the paragraph — margin auto centering conflicts with flex alignment
3. `container` class with `px-0` override creates padding conflicts
4. The flex container lacks explicit `items-start` for desktop — `md:items-center` vertically centers but doesn't enforce horizontal alignment

### Fix (1 file: `src/components/WelcomeSection.tsx`)

Replace ambiguous alignment utilities with explicit, robust flexbox properties:

1. **Remove `text-center` / `mx-auto` entirely** — on desktop these should never apply; on mobile, use flex `items-center` instead of text-align
2. **Use `items-start` as default**, `md:items-center` only for vertical centering in row mode
3. **Set explicit `text-left` always** on the text block (no responsive toggle)
4. **Replace `container px-0`** with explicit `max-w-[1400px] mx-auto` to avoid container class inconsistencies
5. **Add `flex-shrink-0`** to the stats grid to prevent unexpected wrapping/sizing
6. **Use `justify-start md:justify-between`** explicitly on the flex row

These changes eliminate all browser-dependent alignment behavior by using only explicit directional properties.

