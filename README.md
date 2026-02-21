# no-coauthor

Git hook that automatically strips AI co-Author lines from your commit messages.

Stop Claude, Copilot, GPT, and other AI tools from showing up as contributors on your GitHub commits.

## Install

### npm (recommended)

```bash
# Per-project
npx no-coauthor install

# Global (all repos on your machine)
npx no-coauthor install --global
```

### curl (no Node.js package needed)

```bash
# Per-project (run inside a git repo)
curl -fsSL https://raw.githubusercontent.com/0xdsgnrd/no-coauthor/main/install.sh | bash

# Global
curl -fsSL https://raw.githubusercontent.com/0xdsgnrd/no-coauthor/main/install.sh | bash -s -- --global
```

### Manual

```bash
git clone https://github.com/0xdsgnrd/no-coauthor.git
cd no-coauthor
bash install.sh
```

## What it does

Installs a `commit-msg` git hook that runs before each commit is finalized. It removes any `Co-Authored-By` line that mentions an AI tool:

- Claude, Anthropic
- Copilot, GitHub Copilot
- GPT, ChatGPT, OpenAI
- Gemini, Bard
- Cursor
- Codeium
- Windsurf
- Tabnine
- Amazon Q, CodeWhisperer

### Before

```
feat: add user authentication

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### After

```
feat: add user authentication
```

## Uninstall

```bash
# Per-project
npx no-coauthor uninstall

# Global
npx no-coauthor uninstall --global
```

## How it works

The hook is a small Node.js script that:

1. Reads the commit message file (passed by git as `$1`)
2. Removes lines matching `Co-Authored-By: <AI tool name>`
3. Cleans up extra blank lines
4. Writes the message back

It runs in milliseconds and doesn't touch anything else in your commit.

## Existing hooks

If you already have a `commit-msg` hook, `no-coauthor` appends to it instead of overwriting. Uninstall cleanly removes only the appended section.

## License

MIT
