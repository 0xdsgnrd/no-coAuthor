'use strict'

// The commit-msg hook script written to .git/hooks/commit-msg
// Uses Node.js instead of bash for cross-platform compatibility

module.exports = `#!/usr/bin/env node
'use strict'

var fs = require('fs')
var file = process.argv[2]

if (!file) process.exit(0)

var AI_PATTERN = /^\\s*Co-Authored-By:.*?(Claude|Copilot|GitHub Copilot|GPT|ChatGPT|OpenAI|Gemini|Bard|Cursor|Codeium|Anthropic|Windsurf|Tabnine|Amazon Q|CodeWhisperer).*$/gim

var msg = fs.readFileSync(file, 'utf8')
msg = msg.replace(AI_PATTERN, '').replace(/\\n{3,}/g, '\\n\\n').trimEnd()
fs.writeFileSync(file, msg + '\\n')
`
