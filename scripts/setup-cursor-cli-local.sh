#!/bin/bash

# Setup script to make cursor-open available globally (no sudo required)
# This adds a local bin directory to your PATH

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOCAL_BIN="$PROJECT_ROOT/.local/bin"
SCRIPT_PATH="$SCRIPT_DIR/cursor-open.sh"
CODE_SCRIPT_PATH="$SCRIPT_DIR/code.sh"
SYMLINK_PATH="$LOCAL_BIN/cursor-open"
CODE_SYMLINK_PATH="$LOCAL_BIN/code"
SHELL_RC="$HOME/.zshrc"

echo "Setting up cursor-open CLI command (local installation)..."

# Create local bin directory
mkdir -p "$LOCAL_BIN"

# Create symlink
if [ -L "$SYMLINK_PATH" ] || [ -f "$SYMLINK_PATH" ]; then
    echo "Removing existing symlink/file..."
    rm "$SYMLINK_PATH"
fi

ln -s "$SCRIPT_PATH" "$SYMLINK_PATH"
echo "✅ Created symlink: $SYMLINK_PATH"

# Create code command symlink
if [ -L "$CODE_SYMLINK_PATH" ] || [ -f "$CODE_SYMLINK_PATH" ]; then
    echo "Removing existing code symlink/file..."
    rm "$CODE_SYMLINK_PATH"
fi

ln -s "$CODE_SCRIPT_PATH" "$CODE_SYMLINK_PATH"
echo "✅ Created symlink: $CODE_SYMLINK_PATH (VS Code-style 'code' command)"

# Check if PATH already includes local bin
if grep -q "$LOCAL_BIN" "$SHELL_RC" 2>/dev/null; then
    echo "✅ PATH already configured in $SHELL_RC"
else
    echo ""
    echo "Adding $LOCAL_BIN to your PATH..."
    echo "" >> "$SHELL_RC"
    echo "# Local bin directory for cursor-open" >> "$SHELL_RC"
    echo "export PATH=\"\$PATH:$LOCAL_BIN\"" >> "$SHELL_RC"
    echo "✅ Added to $SHELL_RC"
    echo ""
    echo "⚠️  Please run: source $SHELL_RC"
    echo "   Or restart your terminal to use 'cursor-open' command"
fi

echo ""
echo "✅ Setup complete! You can now use 'code' or 'cursor-open' from anywhere."
echo ""
echo "Usage examples:"
echo "  code                     # Opens current directory (VS Code-style)"
echo "  code .                   # Opens current directory"
echo "  code ~/Projects          # Opens Projects directory"
echo "  cursor-open              # Alternative command name"
