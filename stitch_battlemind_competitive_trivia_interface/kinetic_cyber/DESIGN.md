---
name: Kinetic Cyber
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#bacac6'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#849490'
  outline-variant: '#3b4a47'
  surface-tint: '#17deca'
  primary: '#49f7e2'
  on-primary: '#003731'
  primary-container: '#03dac6'
  on-primary-container: '#005a51'
  inverse-primary: '#006a60'
  secondary: '#dab9ff'
  on-secondary: '#460283'
  secondary-container: '#602b9d'
  on-secondary-container: '#cfa7ff'
  tertiary: '#cae0ff'
  on-tertiary: '#003258'
  tertiary-container: '#97c6ff'
  on-tertiary-container: '#00528c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#4ffbe6'
  primary-fixed-dim: '#17deca'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#eedbff'
  secondary-fixed-dim: '#dab9ff'
  on-secondary-fixed: '#2a0053'
  on-secondary-fixed-variant: '#5e289b'
  tertiary-fixed: '#d1e4ff'
  tertiary-fixed-dim: '#9ecaff'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#00497d'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The design system is built for a high-stakes, competitive atmosphere, drawing heavy inspiration from professional eSports broadcasts and futuristic interfaces. It targets a demographic that values precision, speed, and mental agility.

The visual style is **Futuristic Glassmorphism**. It utilizes deep, layered backgrounds with frosted-glass surfaces to create a sense of digital depth. High-fidelity translucent layers, combined with vibrant neon accents, evoke a "command center" feel. Interactions should feel frictionless and high-tech, utilizing subtle light-leak animations and glowing state transitions to emphasize the competitive nature of the platform.

## Colors
The palette is rooted in a deep "Blue-Black" abyss to provide maximum contrast for neon elements. 

- **Core Tones:** Luminous Cyan serves as the primary action color, providing a technical, energetic feel. Neon Purple acts as the secondary accent for progression and leveling.
- **Team Identity:** Defined roles use high-chroma variants of Blue (#2196F3), Red (#F44336), Yellow (#FFC107), and White (#FFFFFF).
- **Surface Strategy:** The "Judge Black" (#212121) is used for solid containers that require more visual weight than the glass cards, specifically for bottom sheets and persistent navigation elements.
- **State Colors:** Errors and warnings utilize the Red and Yellow team colors respectively to maintain a unified palette.

## Typography
This design system uses a dual-font strategy to balance character with utility. 

**Sora** is utilized for headlines and labels. Its geometric structure and unique apertures provide a futuristic, tech-forward aesthetic suitable for scores, timers, and "VS" screens. **Inter** is the workhorse for body text and settings, ensuring maximum legibility during fast-paced trivia reading.

All uppercase labels should include slight letter-spacing to enhance the "UI/HUD" feel. For critical data points like countdowns, use `display-lg` with a Cyan glow effect.

## Layout & Spacing
The layout follows a 12-column grid for tablet and a 4-column grid for mobile. 

- **Margins:** 20px side margins ensure content does not hit the curved edges of modern Android displays.
- **Rhythm:** An 8px base unit drives all spacing. Elements are grouped using 8px (sm) or 16px (md) gaps, while major sections are separated by 32px (xl).
- **Safe Areas:** Special attention is paid to the bottom gesture bar and top punch-hole cameras, ensuring glass cards extend into these areas with proper background blur while keeping interactive elements within the "safe zone."

## Elevation & Depth
Depth is not communicated through traditional drop shadows, but through **Tonal Stacking** and **Backdrop Blurs**.

1.  **Level 0 (Background):** Deep Blue-Black (#0B0E14) solid fill.
2.  **Level 1 (Glass Cards):** Semi-transparent white (Opacity 0.05 - 0.1) with a 20px-32px Background Blur. A 1px border at 0.1 opacity (White) defines the edge.
3.  **Level 2 (Active States):** Elements at this level gain a "Soft Glow." Instead of a black shadow, they use a diffused drop shadow of their own accent color (e.g., Cyan shadow for a Cyan button) with a spread of 15px and low opacity (0.3).
4.  **Level 3 (Modals/Overlays):** Solid "Judge Black" surfaces or high-opacity glass, appearing at the top of the stack to command focus.

## Shapes
The shape language is sophisticated and approachable, avoiding the harshness of 0px corners to maintain a premium "modern app" feel.

- **Primary Radius:** 16px (0.5rem base) for standard buttons and small cards.
- **Large Radius:** 24px (1rem/1.5rem variants) for main game cards and container modules.
- **Interactive Elements:** Input fields and chips should mirror the 16px radius for consistency.
- **Visual Continuity:** Outer containers should always have a larger radius than the inner elements they contain to maintain "nested harmony."

## Components
Consistent implementation of these components ensures the eSports aesthetic is maintained throughout the design system.

- **Buttons:** 
  - *Primary:* Luminous Cyan fill with black text. On hover/active, it gains a cyan outer glow.
  - *Secondary:* Transparent with a 1px Cyan border.
  - *Glass:* Translucent white with a blur, used for less critical actions.
- **Cards (Glass):** The signature component. Must include `backdrop-filter: blur(20px)`, a `1px white opacity 0.1` border, and a subtle inner gradient (top-left to bottom-right) to simulate light hitting glass.
- **Chips:** Used for "Team Selection" or "Category Tags." These should be pill-shaped with color-coded borders matching the team colors.
- **Input Fields:** Darker than the background (#000000 at 0.2 opacity) with a subtle bottom-border glow that activates when focused.
- **Progress Bars:** Thin, sleek lines. The "filling" part of the bar should have a linear gradient (Primary Color to Transparent) and a glowing "lead" point to show movement.
- **Icons:** 24px grid, 1.5pt stroke weight. Use "Linear" styles with open paths to feel technical and airy.