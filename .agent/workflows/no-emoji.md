---
description: No-emoji rule - Use SVG icons instead of emojis in all components
---

# No Emoji Rule for PrivacyChecker

## IMPORTANT: Always use SVG icons, NEVER use emojis

When building UI components for this project, follow these rules:

### ❌ NEVER USE
- Unicode emojis like 💡 ⚠️ ✓ ✗ 📊 🔒
- Emoji shortcodes
- CSS emoji backgrounds

### ✅ ALWAYS USE
- Inline SVG icons from Heroicons (outline style)
- Custom SVG components when needed
- Icon classes with proper stroke/fill attributes

## Common Icon Replacements

| Emoji | SVG Replacement |
|-------|------------------|
| 💡 | Lightbulb icon (M9.663 17h4.673M12 3v1...) |
| ⚠️ | Warning triangle (M12 9v2m0 4h.01m-6.938 4h13.856...) |
| ✓ | Checkmark (M5 13l4 4L19 7) |
| ✗ | X mark (M6 18L18 6M6 6l12 12) |
| 🔒 | Lock icon (M12 15v2m-6 4h12...) |
| 📊 | Chart bar icon (M9 19v-6a2 2 0 00-2-2H5...) |
| 📢 | Speakerphone icon (M11 5.882V19.24...) |
| 👥 | Users icon (M17 20h5v-2a3 3 0 00-5.356...) |
| 💳 | Credit card icon (M3 10h18M7 15h1...) |
| 🌐 | Globe icon (M21 12a9 9 0 01-9 9m9-9...) |
| 🔧 | Settings/cog icon (M10.325 4.317c.426-1.756...) |
| ❓ | Question mark icon (M8.228 9c.549-1.165...) |

## Example SVG Component

```tsx
const WarningIcon = () => (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
```

## Background Color Rule

Also avoid colored backgrounds like:
- ❌ `bg-red-50`, `bg-green-100`, `bg-amber-50`

Instead use:
- ✅ `bg-white border border-COLOR-200` (e.g., `bg-white border border-red-200`)

This creates a cleaner, more professional look with colored borders for differentiation.
