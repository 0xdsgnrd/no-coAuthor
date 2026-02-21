#!/bin/sh
#
# no-coauthor — standalone installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/0xdsgnrd/no-coauthor/main/install.sh | sh
#
# Or run directly:
#   sh install.sh [--global] [--no-node]
#

set -e

# Node.js hook (default — better regex support)
HOOK_NODE='#!/usr/bin/env node
"use strict"

var fs = require("fs")
var file = process.argv[2]

if (!file) process.exit(0)

var AI_PATTERN = /^\s*Co-Authored-By:.*?(Claude|Copilot|GitHub Copilot|GPT|ChatGPT|OpenAI|Gemini|Bard|Cursor|Codeium|Anthropic|Windsurf|Tabnine|Amazon Q|CodeWhisperer).*$/gim

var msg = fs.readFileSync(file, "utf8")
msg = msg.replace(AI_PATTERN, "").replace(/\n{3,}/g, "\n\n").trimEnd()
fs.writeFileSync(file, msg + "\n")
'

# POSIX shell hook (fallback — zero dependencies)
HOOK_POSIX='#!/bin/sh
# no-coauthor — strips AI co-author lines from commit messages

FILE="$1"
[ -z "$FILE" ] && exit 0
[ ! -f "$FILE" ] && exit 0

grep -v -i -E "^[[:space:]]*Co-Authored-By:.*(Claude|Copilot|GitHub Copilot|GPT|ChatGPT|OpenAI|Gemini|Bard|Cursor|Codeium|Anthropic|Windsurf|Tabnine|Amazon Q|CodeWhisperer)" "$FILE" > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
'

# Pick the right hook
USE_POSIX=false
for arg in "$@"; do
    [ "$arg" = "--no-node" ] && USE_POSIX=true
done

if [ "$USE_POSIX" = false ] && command -v node > /dev/null 2>&1; then
    HOOK_CONTENT="$HOOK_NODE"
    echo "no-coauthor: using Node.js hook"
else
    HOOK_CONTENT="$HOOK_POSIX"
    if [ "$USE_POSIX" = true ]; then
        echo "no-coauthor: using POSIX shell hook (--no-node)"
    else
        echo "no-coauthor: Node.js not found, using POSIX shell hook"
    fi
fi

# Install
IS_GLOBAL=false
for arg in "$@"; do
    [ "$arg" = "--global" ] && IS_GLOBAL=true
done

if [ "$IS_GLOBAL" = true ]; then
    HOOKS_DIR="$HOME/.git-hooks"
    mkdir -p "$HOOKS_DIR"
    printf '%s\n' "$HOOK_CONTENT" > "$HOOKS_DIR/commit-msg"
    chmod +x "$HOOKS_DIR/commit-msg"
    git config --global core.hooksPath "$HOOKS_DIR"
    echo "no-coauthor: global hook installed at $HOOKS_DIR"
    echo "no-coauthor: all git repos on this machine will strip AI co-author lines"
else
    GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || true
    if [ -z "$GIT_ROOT" ]; then
        echo "no-coauthor: not inside a git repository"
        echo ""
        echo "Options:"
        echo "  Run inside a git repo for per-project install"
        echo "  Run with --global for all repos"
        exit 1
    fi

    HOOKS_DIR="$GIT_ROOT/.git/hooks"
    mkdir -p "$HOOKS_DIR"
    printf '%s\n' "$HOOK_CONTENT" > "$HOOKS_DIR/commit-msg"
    chmod +x "$HOOKS_DIR/commit-msg"
    echo "no-coauthor: hook installed in $HOOKS_DIR"
fi
