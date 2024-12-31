#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get today's date
TODAY=$(date +"%Y-%m-%d")

# Git operations
git_update() {
    git add project-history.md
    git commit -m "Update: Project history for $TODAY"
    git push origin main || echo "Failed to push to GitHub. Please push manually."
}

# Backup current history
cp project-history.md project-history.backup.md

# Update function
update_history() {
    local TEMP_FILE=$(mktemp)
    
    echo -e "${BLUE}Updating project history...${NC}"
    
    # Get git changes since last commit
    echo -e "\n### Session $TODAY" > $TEMP_FILE
    
    # Get changed files
    echo -e "\n#### Files Changed" >> $TEMP_FILE
    git diff --name-status | while read -r line; do
        echo "- $line" >> $TEMP_FILE
    done
    
    # Get new dependencies
    echo -e "\n#### Dependencies Added/Updated" >> $TEMP_FILE
    git diff package.json client/package.json 2>/dev/null | grep "+" | grep "\"@" | while read -r line; do
        echo "- $line" >> $TEMP_FILE
    done
    
    # Get commit messages
    echo -e "\n#### Changes Made" >> $TEMP_FILE
    git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD >> $TEMP_FILE
    
    # Insert new session after "## Session History" line
    sed -i "/## Session History/r $TEMP_FILE" project-history.md
    
    # Cleanup
    rm $TEMP_FILE
}

# Main execution
echo -e "${GREEN}Starting automatic history update...${NC}"

# Update history
update_history

# Show diff
echo -e "${BLUE}Review the changes:${NC}"
git diff project-history.md

# Ask for confirmation
read -p "Would you like to commit these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git_update
    echo -e "${GREEN}History updated and committed!${NC}"
else
    # Restore backup
    mv project-history.backup.md project-history.md
    echo -e "${BLUE}Changes discarded. Restored from backup.${NC}"
fi

# Cleanup backup
rm -f project-history.backup.md
