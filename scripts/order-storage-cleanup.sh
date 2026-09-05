#!/bin/bash

set -euo pipefail

STORAGE_DIRS=(
    "/root/backbone-app-api/uploads/orders"
    "/root/backbone-app-api/UplodedOrderFiles/orders"
)

BACKUP_DIR="/root/backups/order-storage"
LOG_FILE="/var/log/order-storage-cleanup.log"

mkdir -p "$BACKUP_DIR"
exec >> "$LOG_FILE" 2>&1

echo "=================================================="
echo "Monthly Order Cleanup Started: $(date)"
echo "=================================================="

VALID_DIRS=()

for dir in "${STORAGE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        VALID_DIRS+=("$dir")
        echo "Storage found: $dir"
    else
        echo "Storage not found, skipping: $dir"
    fi
done

if [ ${#VALID_DIRS[@]} -eq 0 ]; then
    echo "ERROR: No storage directories found."
    exit 1
fi

# --------------------------------------------------
# KEEP THE LATEST 15 DAYS
# DELETE EVERYTHING OLDER THAN 15 DAYS
# --------------------------------------------------

CUTOFF="$(date -d '15 days ago' '+%Y-%m-%d %H:%M:%S')"

echo "Current time : $(date)"
echo "Cutoff time  : $CUTOFF"
echo "Files older than cutoff will be deleted."

BACKUP_DATE="$(date '+%Y-%m-%d')"
BACKUP_FILE="$BACKUP_DIR/orders-backup-${BACKUP_DATE}.tar.gz"

FILE_LIST="$(mktemp)"
trap 'rm -f "$FILE_LIST"' EXIT

# --------------------------------------------------
# FIND FILES OLDER THAN 15 DAYS
# --------------------------------------------------

for dir in "${VALID_DIRS[@]}"; do
    find "$dir" \
        -type f \
        ! -newermt "$CUTOFF" \
        -print0 >> "$FILE_LIST"
done

if [ ! -s "$FILE_LIST" ]; then
    echo "No files older than 15 days found."
    echo "Nothing to backup or delete."
    echo "Cleanup finished: $(date)"
    echo "=================================================="
    exit 0
fi

FILE_COUNT="$(tr -cd '\0' < "$FILE_LIST" | wc -c)"

echo "Files selected: $FILE_COUNT"
echo "Backup file: $BACKUP_FILE"

# --------------------------------------------------
# 1. BACKUP
# --------------------------------------------------

echo "Creating backup..."

tar \
    --warning=no-file-changed \
    --null \
    -T "$FILE_LIST" \
    -czf "$BACKUP_FILE"

echo "Backup created successfully."

# --------------------------------------------------
# 2. VERIFY BACKUP
# --------------------------------------------------

echo "Verifying backup..."

if ! tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
    echo "ERROR: Backup verification FAILED."
    echo "DELETION ABORTED."
    exit 1
fi

echo "Backup verification successful."

# --------------------------------------------------
# 3. DELETE
# --------------------------------------------------

echo "Deleting $FILE_COUNT files..."

xargs -0 -r rm -f -- < "$FILE_LIST"

echo "Files deleted successfully."

# --------------------------------------------------
# 4. REMOVE EMPTY DIRECTORIES
# --------------------------------------------------

for dir in "${VALID_DIRS[@]}"; do
    find "$dir" -mindepth 1 -type d -empty -delete
done

echo "Empty directories cleaned."

echo "Monthly cleanup completed successfully: $(date)"
echo "=================================================="
