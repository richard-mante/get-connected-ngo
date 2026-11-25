# Motion Guidelines

## Principles
- Motion supports the organization's story and should never distract from content.
- Prefer short reveals, subtle scroll-linked movement, and restrained transitions.
- Avoid scroll hijacking, long pinned sequences, and constant parallax.
- Keep navigation and calls to action immediately usable.

## Implementation
- GSAP and ScrollTrigger manage entrance timelines and reveal effects.
- Lenis provides optional smooth wheel scrolling and is synchronized with ScrollTrigger through the GSAP ticker.
- The motion module checks `prefers-reduced-motion` and skips smooth scrolling and entrance animation when requested.
- Prefer transform and opacity animation to reduce layout work.
- Test on touch devices and lower-powered phones.

## Content
Replace temporary stock photography with Get Connected's approved images. Do not invent impact metrics, testimonials, beneficiary stories, or program details.
