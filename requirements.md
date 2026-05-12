# Confidential

## What You're Building

To help non-technical users create a static web page without writing code.

You'll be building a core piece of that experience: a browser-based builder where users can pick a starting template, customize it to fit their needs, and export it as a ready-to-use static HTML page.

## User Stories

- As a user, I want to browse available templates so I can find a starting point that fits my needs.
- As a user, I want to click into any part of the page and adjust its appearance so the page feels like mine.
- As a user, I want to export my finished page to a static HTML.

## Acceptance Criteria

- A user with no instructions can pick a template, make meaningful changes, and export a page within a few minutes.
- Each template has configurable settings at two levels: page and element.
- Changes are reflected immediately in the preview.
- The exported file opens correctly in a browser with no additional tooling.
- At least 2 templates are available, each with a different look and feel.

## Bonus Questions

_Optional, written responses, no implementation required_

- If you had to cut one feature from this assignment due to time constraints, which would it be and why?
- Based on your experience building this, propose one feature or improvement that you believe would meaningfully enhance the product. Explain why you think it's important and provide a brief outline on how you would implement it.

## Technical Notes

- You must use React for the UI and [`@flodesk/grain`](https://grain.flodesk.com/) ([npm](https://www.npmjs.com/package/@flodesk/grain)) as your component and styling foundation. Grain is Flodesk's design system and reflects the real toolkit you'd be working with on the job.
- Third-party CSS or UI frameworks (Tailwind, MUI, Chakra, Bootstrap, etc.) are not permitted. Everything else (bundler, state management, ...) is your call.
