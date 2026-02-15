#!/bin/bash

# CLI command 'code' that opens Cursor editor (VS Code-style CLI)
# Usage: code [path]
# If no path is provided, opens current directory

# Get the path (default to current directory)
TARGET_PATH="${1:-$(pwd)}"

# Expand ~ to home directory
TARGET_PATH="${TARGET_PATH/#\~/$HOME}"

# Convert to absolute path
if [[ ! "$TARGET_PATH" = /* ]]; then
    TARGET_PATH="$(cd "$TARGET_PATH" 2>/dev/null && pwd || echo "$TARGET_PATH")"
fi

# Check if Cursor is installed
if command -v cursor &> /dev/null; then
    # Use cursor command if available
    cursor "$TARGET_PATH"
elif [ -d "/Applications/Cursor.app" ]; then
    # Use open command for macOS
    open -a Cursor "$TARGET_PATH"
else
    echo "Error: Cursor not found. Please install Cursor or add it to your PATH."
    exit 1
fi
