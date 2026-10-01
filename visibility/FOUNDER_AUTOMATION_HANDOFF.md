# Founders Package Automation Handoff

Client: Haven Design & Build LLC  
Package status: Active Founders Package  
Created: 2026-08-01
Updated: 2026-08-19

## Automation Objective

Use the existing Haven visibility monitor as the foundation for Founders Package service delivery. The monitor should now prepare weekly growth-call inputs and monthly execution tasks, not only website visibility checks.

## Weekly Monday Run

Prepare a concise weekly report using:

- `docs/founders-package-growth-system.md`
- `visibility/FOUNDER_WEEKLY_GROWTH_REPORT.md`
- `visibility/FOUNDER_COMPETITOR_TRACKER.md`
- `visibility/SLACK_SOCIAL_APPROVAL_WORKFLOW.md`
- `visibility/SEARCH_CONSOLE_INDEXING_CHECKLIST.md`
- `visibility/GOOGLE_BUSINESS_PROFILE_ACTIONS.md`
- `visibility/CITATION_TRACKER.csv`
- `llms.txt`
- `data/business-info.json`

Output sections:

- Search Console metrics to collect.
- Google Analytics metrics to collect.
- GBP update recommendations.
- Website maintenance recommendations.
- SEO/AEO/GEO recommendations.
- Competitor movement to check.
- Partner/backlink outreach targets.
- Four weekly priorities.
- Manual actions for Micah or Ghost.

## Weekly Social / GBP Post Prep

Each week, prepare one social post and one Google Business Profile post from:

- `visibility/FOUNDER_SOCIAL_AND_GBP_CALENDAR.md`
- `visibility/SLACK_SOCIAL_APPROVAL_WORKFLOW.md`
- Current target services.
- Any approved project photos or client updates.

If no new assets exist, use one of the evergreen drafts and request a real project photo from Micah.

Post drafts should be formatted for Slack approval in `#social`, using the approval format and emoji rules in `visibility/SLACK_SOCIAL_APPROVAL_WORKFLOW.md`.

## GEO / GBP Automation Targets

Because Ghost AI Solutions GEO has approved Google Business Profile API access, the monthly-client automation should run these actions for Haven:

- Publish one GBP post per week that links to a priority page.
- Rotate target topics across North Atlanta renovation, Cobb County renovation cost planning, Cherokee County decks/outdoor living, and Marietta home renovation comparisons.
- Generate one matching social draft for Slack approval in the Design Haven Build `#social` channel.
- Create photo caption drafts whenever Micah provides real project photos.
- Prepare GBP Q&A recommendations from the current website FAQs, but flag any answer that needs owner approval before publishing.
- Track which URLs were promoted and include them in the Monday growth report.

Recommended first four GBP links:

- `https://www.designhavenbuild.com/resources/north-atlanta-renovation-contractor-checklist/`
- `https://www.designhavenbuild.com/resources/renovation-cost-cobb-county-ga/`
- `https://www.designhavenbuild.com/resources/deck-builder-cherokee-county-ga/`
- `https://www.designhavenbuild.com/home-renovation-companies-marietta-ga/`

## Monthly Review

At the start of each month:

- Build 4 social posts.
- Build 4 GBP posts.
- Refresh competitor tracker.
- Refresh citation/backlink tracker.
- Identify one website improvement.
- Identify one AEO/GEO page or FAQ improvement.
- List manual GBP/review/photo needs.

## Manual Data Dependencies

Do not invent metrics. If Google Analytics, Search Console, or GBP live data is not available to the automation, mark the metric as `manual pull needed` and provide exact instructions for what to capture.

## Current Priority

Move Haven from homepage-only visibility into dedicated local and answer-engine pages:

- `/home-renovation-companies-marietta-ga/`
- `/areas/cherokee-county-ga/`
- `/areas/marietta-ga/`
- `/areas/cobb-county-ga/`
- `/areas/atlanta-ga/`
- `/resources/north-atlanta-renovation-contractor-checklist/`
- `/resources/renovation-cost-cobb-county-ga/`
- `/resources/deck-builder-cherokee-county-ga/`
- `/services/kitchen-remodeling-marietta-ga/`
- `/services/bathroom-remodeling-marietta-ga/`
- `/services/deck-builder-marietta-ga/`
- `/services/commercial-renovation-marietta-ga/`
