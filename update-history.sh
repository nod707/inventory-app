#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get today's date
TODAY=$(date +"%Y-%m-%d")

# Create temporary file
TEMP_FILE=$(mktemp)

echo -e "${BLUE}Adding new session to project history...${NC}"

# Get user input
echo -e "${GREEN}Enter features added/modified (type 'done' when finished):${NC}"
echo "#### Features Added/Modified" > $TEMP_FILE
while true; do
    read -p "- " feature
    if [ "$feature" = "done" ]; then
        break
    fi
    echo "- $feature" >> $TEMP_FILE
done

echo -e "\n${GREEN}Enter technical details (type 'done' when finished):${NC}"
echo -e "\n#### Technical Details" >> $TEMP_FILE
while true; do
    read -p "- " detail
    if [ "$detail" = "done" ]; then
        break
    fi
    echo "- $detail" >> $TEMP_FILE
done

echo -e "\n${GREEN}Enter current challenges (type 'done' when finished):${NC}"
echo -e "\n#### Current Challenges" >> $TEMP_FILE
while true; do
    read -p "- " challenge
    if [ "$challenge" = "done" ]; then
        break
    fi
    echo "- $challenge" >> $TEMP_FILE
done

echo -e "\n${GREEN}Enter next steps (type 'done' when finished):${NC}"
echo -e "\n#### Next Steps" >> $TEMP_FILE
while true; do
    read -p "- " step
    if [ "$step" = "done" ]; then
        break
    fi
    echo "- $step" >> $TEMP_FILE
done

# Create new session entry
NEW_SESSION="### Session $TODAY\n$(cat $TEMP_FILE)\n"

# Insert new session after "## Session History" line
sed -i "/## Session History/a\\$NEW_SESSION" project-history.md

echo -e "${BLUE}Project history has been updated!${NC}"
echo -e "${GREEN}Don't forget to commit the changes:${NC}"
echo "git add project-history.md"
echo "git commit -m \"Update: Project history for $TODAY\""
echo "git push origin main"

# Cleanup
rm $TEMP_FILE
