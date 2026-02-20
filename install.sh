#!/bin/bash
#
# no-coauthor — standalone installer (no Node.js required)
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/0xdsgnrd/no-coauthor/main/install.sh | bash
#
# Or run directly:
#   bash install.sh [--global]
#

set -e

HOOK_CONTENT='#!/usr/bin/env node
"use strict"

var fs = require("fs")
var file = process.argv[2]

if (!file) process.exit(0)

var AI_PATTERN = /^\s*Co-Authored-By:.*?(Claude|Copilot|GitHub Copilot|GPT|ChatGPT|OpenAI|Gemini|Bard|Cursor|Codeium|Anthropic|Windsurf|Tabnine|Amazon Q|CodeWhisperer).*$/gim

var msg = fs.readFileSync(file, "utf8")
msg = msg.replace(AI_PATTERN, "").replace(/\n{3,}/g, "\n\n").trimEnd()
fs.writeFileSync(file, msg + "\n")
'

# Check for Node.js (required by the hook)
if ! command -v node &> /dev/null; then
    echo "no-coauthor: Node.js is required but not found."
    echo "Install it from https://nodejs.org"
    exit 1
fi

if [ "$1" = "--global" ]; then
    HOOKS_DIR="$HOME/.git-hooks"
    mkdir -p "$HOOKS_DIR"
    echo "$HOOK_CONTENT" > "$HOOKS_DIR/commit-msg"
    chmod +x "$HOOKS_DIR/commit-msg"
    git config --global core.hooksPath "$HOOKS_DIR"
    echo "no-coauthor: global hook installed at $HOOKS_DIR"
    echo "no-coauthor: all git repos on this machine will strip AI co-author lines"
else
    GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
    if [ -z "$GIT_ROOT" ]; then
        echo "no-coauthor: not inside a git repository"
        echo ""
        echo "Options:"
        echo "  Run inside a git repo for per-project install"
        echo "  Run with --global for all repos: bash install.sh --global"
        exit 1
    fi

    HOOKS_DIR="$GIT_ROOT/.git/hooks"
    mkdir -p "$HOOKS_DIR"
    echo "$HOOK_CONTENT" > "$HOOKS_DIR/commit-msg"
    chmod +x "$HOOKS_DIR/commit-msg"
    echo "no-coauthor: hook installed in $HOOKS_DIR"
fi
