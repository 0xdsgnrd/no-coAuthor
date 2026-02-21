# no-coAuthor

Git hook that automatically strips AI co-author lines from your commit messages.

Stop Claude, Copilot, GPT, and other AI tools from showing up as contributors on your GitHub commits.

## Why this exists

Some AI coding tools add `Co-Authored-By` lines to your commits automatically. A few offer settings to disable it, but those settings are unreliable:

| Tool | Adds Co-Authored-By? | Built-in disable? | Reliable? |
|------|---------------------|-------------------|-----------|
| **Claude Code** | Yes | `attribution` in settings.json | No -- 10+ open bugs, setting ignored intermittently |
| **Cursor** | Yes | Settings > Agent > Attribution | No -- IDE updates silently re-enable it |
| **Copilot Agent** | Yes (agent becomes commit author) | No setting exists | N/A |
| **Gemini Code Assist** | Yes on PR suggestions | No granular setting | N/A |

`no-coauthor` is a git-level safety net. It runs inside git itself, not inside the AI tool, so it catches everything regardless of which tool added it or whether settings are configured correctly.

**Use both together:** Configure your AI tool's built-in setting (prevention) AND install `no-coauthor` (enforcement). Belt and suspenders.

### Configure built-in settings (complementary)

**Claude Code** -- Add to `~/.claude/settings.json`:
```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

**Cursor** -- Go to Settings > Agent > Attribution and disable it. Re-check after updates.

**Copilot Agent / Gemini Code Assist** -- No built-in setting. `no-coauthor` is your only option.

## Install

### npm (recommended)

```bash
# Per-project
npx no-coauthor install

# Global (all repos on your machine)
npx no-coauthor install --global
```

### Bun

```bash
bunx no-coauthor install
bunx no-coauthor install --global
```

### curl (auto-detects Node.js, falls back to POSIX shell)

```bash
# Per-project (run inside a git repo)
curl -fsSL https://raw.githubusercontent.com/0xdsgnrd/no-coauthor/main/install.sh | sh

# Global
curl -fsSL https://raw.githubusercontent.com/0xdsgnrd/no-coauthor/main/install.sh | sh -s -- --global
```

### Manual

```bash
git clone https://github.com/0xdsgnrd/no-coauthor.git
cd no-coauthor
bash install.sh
```

## What it catches

Strips `Co-Authored-By` lines mentioning any of these AI tools:

- Claude, Anthropic
- Copilot, GitHub Copilot
- GPT, ChatGPT, OpenAI
- Gemini, Bard
- Cursor
- Codeium, Windsurf
- Tabnine
- Amazon Q, CodeWhisperer

Human co-authors are always kept.

### Before

```
feat: add user authentication

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
Co-Authored-By: Jane Doe <jane@example.com>
```

### After

```
feat: add user authentication

Co-Authored-By: Jane Doe <jane@example.com>
```

## Uninstall

```bash
# Per-project
npx no-coauthor uninstall

# Global
npx no-coauthor uninstall --global
```

## No Node.js? No problem

By default, the hook uses Node.js for better regex support. If Node.js isn't available, it automatically falls back to a POSIX shell hook that works on any system with `/bin/sh` and `grep`. Zero dependencies.

```bash
# Force the shell version
npx no-coauthor install --no-node

# Or via curl
curl -fsSL https://raw.githubusercontent.com/0xdsgnrd/no-coauthor/main/install.sh | sh -s -- --no-node
```

## How it works

The hook runs before each commit is finalized:

1. Reads the commit message file (passed by git as `$1`)
2. Removes lines matching `Co-Authored-By: <AI tool name>`
3. Cleans up extra blank lines
4. Writes the message back

It runs in milliseconds and doesn't touch anything else in your commit.

## Existing hooks

If you already have a `commit-msg` hook, `no-coauthor` appends to it instead of overwriting. Uninstall cleanly removes only the appended section.

## License

MIT
