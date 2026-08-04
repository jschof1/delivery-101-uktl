# Proposal configuration guide

Use `configs/example.json` as the starting point and compare it with `configs/norbert.json` for a populated example.

## Client-specific fields

Populate the client name, legal or trading name, contact, services, areas, current-state priorities, walkthrough context, roadmap, system layers, verified examples, ownership wording, pipeline stages, price, guarantee, FAQ and CTA destination.

The repeatable fields are:

- `meta`: title, description and optional canonical URL
- `brand`: UK Trade Leads shell identity and footer URL
- `client`: client and contact identity
- `hero`, `signals`, `review`, `video`: first-screen proposition and evidence context
- `roadmap`, `system.layers`, `pipeline.stages`: the operating plan
- `examples`: verified live sites with a name, description, URL and screenshot path
- `ownership`, `offer`, `faq`, `final`: approval-sensitive copy and next step

## Keep the UKTL shell

Keep the charcoal background, bright yellow `#fbc02d`, compact spacing, rounded utility cards, practical headings, system vocabulary, walkthrough and verified-proof convention. Change client identity and content, not the underlying visual system, unless Jack explicitly approves a brand variation.

## Before publishing

- Verify client name, contact, services and areas against the brief.
- Verify every public example live and keep its screenshot matched to its URL.
- Do not present private, local-only or uncertain work as public proof.
- Confirm price, guarantee, ownership and third-party subscription terms.
- Confirm the CTA destination and walkthrough media id.
- Run the build, `git diff --check`, and desktop and mobile visual QA.
