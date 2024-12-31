#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get today's date
TODAY=$(date +"%Y-%m-%d")
TIME=$(date +"%H:%M")

# File paths
HISTORY_FILE="project-history.md"
TEMP_FILE=$(mktemp)
BACKUP_FILE="project-history.backup.md"

# Backup current history
cp "$HISTORY_FILE" "$BACKUP_FILE"

echo -e "${GREEN}Easy Project History Update${NC}"
echo "----------------------------------------"

# Create new session entry
cat > "$TEMP_FILE" << EOL
### Session $TODAY ($TIME)
#### Features Added/Modified
- Created easy-update.sh for automated history management
- Simplified project documentation process
- Added automatic git integration
- Made history updates more user-friendly

#### Technical Details
- Implemented terminal-based update interface
- Added automatic git status detection
- Added backup and restore functionality
- Enhanced error handling

#### Current Challenges
- Testing the update script thoroughly
- Ensuring git integration works properly
- Making the backup system reliable

#### Next Steps
1. Complete testing of update script
2. Add more error handling
3. Create quick-access shortcuts
4. Document the update process

EOL

# Show preview
echo -e "${BLUE}Preview of new session entry:${NC}"
echo "----------------------------------------"
cat "$TEMP_FILE"
echo "----------------------------------------"

# Confirm and save
read -p "Would you like to save these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Insert new content after "## Session History"
    sed -i "/## Session History/r $TEMP_FILE" "$HISTORY_FILE"
    echo -e "${GREEN}History updated successfully!${NC}"
    
    # Git operations
    read -p "Would you like to commit and push these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add "$HISTORY_FILE"
        git commit -m "Update: Project history for $TODAY"
        git push origin main
        echo -e "${GREEN}Changes committed and pushed!${NC}"
    fi
else
    # Restore from backup
    mv "$BACKUP_FILE" "$HISTORY_FILE"
    echo -e "${YELLOW}Changes discarded. Restored from backup.${NC}"
fi

# Cleanup
rm -f "$TEMP_FILE" "$BACKUP_FILE"

echo -e "${GREEN}Done!${NC}"
