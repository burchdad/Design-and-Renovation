# Haven Growth Engine

This is the portable configuration kit for a private AI growth assistant dedicated to Haven Design & Build. It is designed to improve local search visibility, answer-engine visibility, generative-search visibility, Google Business Profile activity, and conversion-focused website content without inventing claims or using spam tactics.

## What it does

- Audits local organic, map-pack, and answer-engine opportunities.
- Turns completed work into concise case studies, service-page improvements, photo captions, Google Business Profile posts, and review-reply drafts.
- Finds gaps in service-area coverage, on-page content, internal links, structured data, citations, and local authority.
- Builds a practical 30-, 60-, or 90-day priority plan from Google Search Console and Google Business Profile data.
- Creates client-readable reports: evidence first, recommendation second, draft last.

It does **not** promise a ranking, submit work, publish content, create reviews, buy links, or make claims that cannot be verified.

## Set up a private custom GPT

1. In an eligible ChatGPT workspace, open the GPT builder at `chatgpt.com/gpts` and select **Create**.
2. Name it **Haven Growth Engine**.
3. Copy the complete contents of [INSTRUCTIONS.md](./INSTRUCTIONS.md) into the GPT’s Instructions field.
4. Upload the five Markdown files in [knowledge](./knowledge/) as Knowledge files.
5. Enable **Web search** and **Code Interpreter & Data Analysis**. Web search lets it verify current search/competitor information; data analysis lets it read exported CSV/XLSX reports.
6. Keep it private. Start with the prompts below and attach current Google Search Console exports, Google Business Profile performance exports/screenshots, or rank-tracker data when available.

OpenAI’s current GPT setup requirements, capability options, and knowledge-file limits are documented in [Creating and editing GPTs](https://help.openai.com/en/articles/8554397-creating-and-editing-gpts). If custom GPT creation is unavailable in the current account, this folder remains usable as the operating brief for a normal ChatGPT project or a future plugin.

## First prompts

- `Run a 30-day local visibility plan for Marietta bathroom remodeling. Tell me exactly what evidence you still need.`
- `Analyze these GSC and GBP exports. Prioritize the three changes most likely to improve qualified local visibility.`
- `Create a publish-ready case study brief from this completed project. Keep every claim tied to the supplied photos and notes.`
- `Audit designhavenbuild.com for the query “deck builder Marietta GA.” Separate organic, local-map, and answer-engine opportunities.`

## Refresh cadence

Update the knowledge files whenever the company adds a verified service, market, project, credential, review, or public-facing contact detail. Upload monthly GSC/GBP/rank-tracker exports to the chat rather than putting changing numbers into the permanent knowledge files.

## Important operating boundary

The assistant can prepare drafts and recommendations. A Haven team member must approve anything public: website edits, Google Business Profile posts, review replies, outreach, directory submissions, schema changes, and social posts.
