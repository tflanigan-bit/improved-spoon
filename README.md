# Character Hub (Character-AI style demo)

A simple browser app that lets you:

- configure a Cloudflare Worker endpoint,
- generate a huge procedural character universe (with a lightweight preview),
- chat with selected personas through your Worker.

## Security note

This app **does not extract or read OpenRouter keys**. Keep your OpenRouter API key in the Cloudflare Worker environment and proxy requests server-side.

## Run

Open `index.html` in a browser.

## Expected Worker response

The app posts JSON payloads like:

```json
{
  "character": "Arcane Strategist #1",
  "message": "hello"
}
```

It expects JSON response with a `reply` field:

```json
{
  "reply": "Hi!"
}
```
