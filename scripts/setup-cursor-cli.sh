#!/bin/bash

# Setup script to make cursor-open available globally
# This creates a symlink in /usr/local/bin so you can use 'cursor-open' from anywhere

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/cursor-open.sh"
CODE_SCRIPT_PATH="$SCRIPT_DIR/code.sh"
SYMLINK_PATH="/usr/local/bin/cursor-open"
CODE_SYMLINK_PATH="/usr/local/bin/code"

echo "Setting up cursor-open CLI command..."

# Check if script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "Error: cursor-open.sh not found at $SCRIPT_PATH"
    exit 1
fi

# Check if symlink already exists
if [ -L "$SYMLINK_PATH" ]; then
    echo "Removing existing symlink..."
    rm "$SYMLINK_PATH"
fi

# Check if file exists (not symlink)
if [ -f "$SYMLINK_PATH" ]; then
    echo "Warning: $SYMLINK_PATH already exists as a regular file."
    echo "Please remove it manually or choose a different name."
    exit 1
fi

# Create symlinks
echo "Creating symlink: $SYMLINK_PATH -> $SCRIPT_PATH"
sudo ln -s "$SCRIPT_PATH" "$SYMLINK_PATH"

echo "Creating symlink: $CODE_SYMLINK_PATH -> $CODE_SCRIPT_PATH"
sudo ln -s "$CODE_SCRIPT_PATH" "$CODE_SYMLINK_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Success! You can now use 'code' or 'cursor-open' from anywhere."
    echo ""
    echo "Usage examples:"
    echo "  code                     # Opens current directory (VS Code-style)"
    echo "  code .                   # Opens current directory"
    echo "  code ~/Projects          # Opens Projects directory"
    echo "  cursor-open              # Alternative command name"
else
    echo "❌ Failed to create symlink. You may need to run with sudo."
    exit 1
fi
