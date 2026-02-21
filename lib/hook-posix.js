'use strict'

// POSIX shell fallback hook — zero dependencies, works on any system with /bin/sh
// Used when Node.js is not available

module.exports = `#!/bin/sh
# no-coauthor — strips AI co-author lines from commit messages
# POSIX shell version (no Node.js required)

FILE="$1"
[ -z "$FILE" ] && exit 0
[ ! -f "$FILE" ] && exit 0

grep -v -i -E "^[[:space:]]*Co-Authored-By:.*(Claude|Copilot|GitHub Copilot|GPT|ChatGPT|OpenAI|Gemini|Bard|Cursor|Codeium|Anthropic|Windsurf|Tabnine|Amazon Q|CodeWhisperer)" "$FILE" > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
`
