# Implementation Notes

## Visual refinement, 2026-09-22

Restored the original 1160px content width, brass gradient hero, navy/olive surfaces, rounded media, smaller section headings and tighter section spacing. Replaced the uneven project mosaic with an aligned three-column portrait grid (two on tablet, one on mobile). Corrected the mobile portrait scrim and removed the fixed 780px hero height. Case players are constrained to 420px to avoid oversized portrait playback.

Scroll reveals now register dynamically loaded projects with the observer instead of revealing every section immediately. Hero elements enter in sequence; reduced motion skips the animation and content stays visible without JavaScript. Desktop project rows were visually checked after animation; mobile Home was checked at 390px and 320px without horizontal overflow. Asset versioning prevents previously cached styles from masking the changes.

## Audit summary

Audit completed before replacing the public entry page.

- The original site was a static English one-page site with a nearly duplicated Portuguese page in `pt/index.html`.
- CSS and JavaScript were embedded in each HTML file. There was no framework, bundler or application router.
- The visual system already used a strong near-black, brass and oxblood palette, Oswald display type, Space Grotesk body type, film grain, large media and a portrait hero. Those elements were retained.
- Vimeo players used click-to-load facades. The new implementation keeps that performance pattern.
- Contact used `maik@maikchanstudio.com`; Instagram, YouTube and LinkedIn links were retained.
- The former service area sold editing packages and used a dated promotional countdown. It did not fit the approved Director & Filmmaker positioning and was replaced by production capabilities and collaboration models.
- The Meta Pixel with ID `1069857728941860` was active in the old page. It is intentionally not active in the new pages until the user explicitly authorizes external PageView and Lead tracking.
- The old English homepage is preserved at `legacy/index-2026-07.html`. The previous Portuguese page remains in the repository, while `/pt` is temporarily redirected to `/` by Vercel so outdated positioning is not published.

## Architecture

- `index.html`: Home.
- `work/index.html`: full project index and filters.
- `services/index.html`: services, capabilities and ways of working.
- `about/index.html`: approved About copy.
- `assets/data/projects.json`: single source of truth for projects.
- `work/project-template.html`: shared case template.
- `scripts/generate-site.mjs`: generates one SEO-ready directory per project and `sitemap.xml`.
- `assets/css/site.css`: shared visual system and responsive behavior.
- `assets/js/site.js`: navigation, reveal behavior and click-to-load Vimeo player.
- `assets/js/projects.js`: data-driven cards and filters.
- Generated case pages contain their primary content in HTML for SEO and no-JavaScript resilience. Shared player behavior remains in `assets/js/site.js`.

Adding a project requires one data entry in `assets/data/projects.json`, its verified assets, and a build. No new case component or hand-written project page is required.

## Vimeo validation

Metadata was collected through Vimeo's official oEmbed endpoint on 2026-09-22. All six IDs returned title, author, description, portrait dimensions, duration and a thumbnail URL.

| ID | oEmbed | Embed URL | Content status |
| --- | --- | --- | --- |
| `1229154554` | Valid | Integrated | Detailed Vimeo description used. |
| `1229142739` | Valid | Integrated | Detailed Vimeo description used. |
| `1229144661` | Valid | Integrated | Detailed Vimeo description used. |
| `1213463839` | Valid | Integrated | Detailed Vimeo description used. |
| `1204975376` | Valid | Integrated | Updated detailed Vimeo description imported on 2026-09-22. |
| `1204966430` | Valid | Integrated | Updated detailed Vimeo description imported on 2026-09-22. |

The local browser created the Vimeo iframe correctly. Playback inside the automated browser could not be fully observed because the embedded frame remained opaque to the inspection surface. Confirm playback once more in the normal browser before publication, particularly if Vimeo domain privacy is enabled.

## Verification

- The data build completed and generated six case routes plus the sitemap.
- The static site check passed for ten pages and all six Vimeo projects after the updated descriptions were imported.
- The Home was reviewed at 1280 × 720 and 390 × 844.
- Services and About were reviewed at 768 × 1024 and 1024 × 768.
- Mobile navigation, Work navigation, filters, touch descriptions and a generated case route were exercised in the browser.
- The standalone Playwright suite is present, but the managed macOS environment blocked its headless browser process before any test code ran. This is an environment launch restriction, not a reported assertion failure. Run `npm test` in a normal local shell or CI before publication.

## Migration notes

- `/en`, `/en/` and `/en/:path` retain their redirects to English routes.
- `/pt` and `/pt/` use temporary redirects to the English Home until a Portuguese version of the new architecture is approved.
- `robots.txt` now advertises `sitemap.xml`.
- No deployment or external publication was performed.

## Content pending

1. Confirm whether the project categories assigned from verified Vimeo descriptions match the intended editorial grouping.
2. Supply verified stills or BTS material if those sections should appear in individual cases.
3. Decide whether to localize the new architecture into Portuguese before replacing the temporary `/pt` redirect.
4. Explicitly authorize Meta Pixel PageView and email-click Lead tracking if it should be restored.


## Original interaction restoration, 2026-09-22

Compared the original `legacy/index-2026-07.html` hero, reel, process and About sections with the new homepage. Inspected all three original About photographs before reusing them.

- Restored opposing pointer parallax for hero photo (22/16px) and text (10/7px), with eased requestAnimationFrame updates that stop once settled. Disabled for coarse pointers, small screens and reduced motion; preference changes are handled live.
- Restored the original showreel, Vimeo 1204975032, immediately below the hero. This is separate from the six portfolio cases. Kept the original 4:3 facade, click-to-load player, keyboard button and added a direct Vimeo link.
- Restored the timeline ruler and gold playhead, using transform animation, offscreen/background pausing and an explicit pause/resume control. Updated the stages for concept, production, post-production and delivery. Mobile uses a vertical static timeline.
- Restored bg-main.jpg, Background 2.jpg and Background 3.jpg to the home About section. Intrinsic dimensions and alt text match the actual images. Replaced the cropped About-page hero image with the original outdoor camera portrait at its natural aspect ratio.
- Preserved the approved About copy, project metadata, routing and contact integrations. No deployment.

Validation: generation and static checks pass for 10 pages and 6 cases; site.js syntax passes. Browser review at 1440, 834 and 390px confirmed no horizontal overflow, desktop and mobile gallery layouts, mobile vertical timeline, and desktop pause/resume behavior. Pointer interaction produced opposite image/text translations as intended. All three local gallery images loaded at their expected dimensions.

Playback limitation: clicking the showreel created the correct Vimeo iframe, but the remote player remained blank in the embedded review browser. Playback itself could not be confirmed here. The direct Vimeo link remains available. Existing standalone browser-test launch limitation from the earlier pass remains; do not report the full Playwright suite as passed. Reduced-motion safeguards were reviewed in code, not emulated in the review browser.


Showreel follow-up: Vimeo oEmbed returned the real title “Você tem medo de errar? ShowReel - Maikon Winter”, duration 77 seconds, aspect ratio 4:3 and the official 1280x960 thumbnail. Added this remote thumbnail to the facade and confirmed it loads at 1280px in the browser. Mobile section reviewed at 390px without overflow. A GET to the player returned HTTP 401 with “We couldn't verify the security of your connection.” This establishes a Vimeo connection restriction in this review environment; playback remains unconfirmed, and no access-control bypass was attempted. The direct Vimeo link remains available.

## Visual refinement, 2026-09-22

- Made the Home hero full viewport height with the navigation over the photograph, following the original composition. The image occupies the right side; title and supporting copy align to the left. Tablet framing was adjusted separately to keep the face visible.
- Changed the headline to “Turn Ideas Into Films” without “I”, including the Home social descriptions. Refined the header with a Director / Filmmaker identity line, a clearer contact action and link underline feedback.
- Increased the hero parallax range and added restrained pointer response to project stills, plus hover feedback to service and work-with blocks. Touch layouts remain static and reduced-motion preferences suppress motion.
- Removed the “How it works” section from Home. The original timeline now sits on Services after the service offers, with a heading tied to the film stages. Desktop retains the animated playhead and pause control; mobile uses the static vertical layout.
- Queried Vimeo oEmbed again for all six project videos. Five thumbnail URLs changed; the Kasparov thumbnail remained the same. Updated the project data and regenerated the case pages and Open Graph images. All six covers loaded in the local Work page.
- Confirmed the Home hero fits a 1280×720 viewport, checked tablet 834×1112 and mobile 390×844 and 320×568 without horizontal overflow. On the shortest phone viewport, the hero extends below the first screen so its text and actions remain readable.

Validation: project-page generation, JavaScript syntax and the static checker passed (10 pages, 6 projects). The Vimeo playback limitation above is unchanged. No publication was performed. New photographs mentioned by the owner have not yet been supplied.
