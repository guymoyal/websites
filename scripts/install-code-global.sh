#!/bin/bash

# Global installation script for 'code' command that opens Cursor
# This installs it system-wide, independent of any project

INSTALL_DIR="$HOME/bin"
SCRIPT_NAME="code"
SCRIPT_CONTENT='#!/bin/bash

# CLI command "code" that opens Cursor editor (VS Code-style CLI)
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
'

echo "Installing global 'code' command..."

# Create ~/bin directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Write the script
SCRIPT_PATH="$INSTALL_DIR/$SCRIPT_NAME"
echo "$SCRIPT_CONTENT" > "$SCRIPT_PATH"
chmod +x "$SCRIPT_PATH"

echo "✅ Created script: $SCRIPT_PATH"

# Check if ~/bin is in PATH
SHELL_RC="$HOME/.zshrc"
if [ -f "$HOME/.bash_profile" ]; then
    SHELL_RC="$HOME/.bash_profile"
fi

if echo "$PATH" | grep -q "$INSTALL_DIR"; then
    echo "✅ $INSTALL_DIR is already in your PATH"
else
    echo ""
    echo "Adding $INSTALL_DIR to your PATH..."
    echo "" >> "$SHELL_RC"
    echo "# Add ~/bin to PATH for global scripts" >> "$SHELL_RC"
    echo "export PATH=\"\$HOME/bin:\$PATH\"" >> "$SHELL_RC"
    echo "✅ Added to $SHELL_RC"
    echo ""
    echo "⚠️  Please run: source $SHELL_RC"
    echo "   Or restart your terminal to use 'code' command"
fi

echo ""
echo "✅ Global installation complete!"
echo ""
echo "The 'code' command is now available system-wide."
echo ""
echo "Usage examples:"
echo "  code              # Opens current directory in Cursor"
echo "  code .            # Opens current directory"
echo "  code ~/Projects   # Opens Projects directory"
echo "  code /path/to/dir # Opens any directory"
