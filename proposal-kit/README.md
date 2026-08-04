# UK Trade Leads proposal kit

This is the reusable proposal source for client-specific UK Trade Leads growth pages.

Create a config from the example, fill the client-specific fields, then build the static page into its own output folder:

```bash
cp proposal-kit/configs/example.json proposal-kit/configs/client-name.json
node proposal-kit/build.mjs \
  --config proposal-kit/configs/client-name.json \
  --out client-proposal-folder
```

The renderer keeps the UK Trade Leads shell consistent and makes the client identity, priorities, evidence, pipeline, offer, ownership wording and FAQ configurable. The generated folder is static and can be deployed to Cloudflare Pages or another static host.

Use the global `$uktl-client-proposal` skill for the intake, evidence, content validation and design QA workflow.
