#!/bin/bash

set -euo pipefail

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------
STORAGE_DIRS=(
    "/root/backbone-app-api/uploads/orders"
    "/root/backbone-app-api/UplodedOrderFiles/orders"
)

BACKUP_DIR="/root/backups/order-storage"
LOG_FILE="/var/log/order-storage-cleanup.log"

# Keep files created in the last 15 days; delete older ones
RETENTION_DAYS=15

mkdir -p "$BACKUP_DIR"
exec >> "$LOG_FILE" 2>&1

echo "=================================================="
echo "Order Cleanup Started: $(date)"
echo "=================================================="

# --------------------------------------------------
# 1. VERIFY STORAGE DIRECTORIES
# --------------------------------------------------
VALID_DIRS=()
for dir in "${STORAGE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        VALID_DIRS+=("$dir")
        echo "Storage directory found: $dir"
    else
        echo "Storage directory not found, skipping: $dir"
    fi
done

if [ ${#VALID_DIRS[@]} -eq 0 ]; then
    echo "ERROR: No valid storage directories found."
    exit 1
fi

CUTOFF="$(date -d "${RETENTION_DAYS} days ago" '+%Y-%m-%d %H:%M:%S')"
echo "Current time : $(date)"
echo "Cutoff time  : $CUTOFF (files older than this will be backed up & deleted)"

BACKUP_DATE="$(date '+%Y-%m-%d_%H%M%S')"
BACKUP_FILE="$BACKUP_DIR/orders-backup-${BACKUP_DATE}.tar"

FILE_LIST="$(mktemp)"
trap 'rm -f "$FILE_LIST"' EXIT

echo "Scanning files older than ${RETENTION_DAYS} days..."
for dir in "${VALID_DIRS[@]}"; do
    find "$dir" \
        -type f \
        ! -newermt "$CUTOFF" \
        -print0 >> "$FILE_LIST"
done

if [ ! -s "$FILE_LIST" ]; then
    echo "No files older than ${RETENTION_DAYS} days found."
    echo "Nothing to backup or delete."
    echo "Cleanup finished: $(date)"
    echo "=================================================="
    exit 0
fi

FILE_COUNT="$(tr -cd '\0' < "$FILE_LIST" | wc -c)"
echo "Files selected for cleanup: $FILE_COUNT"
echo "Creating fast backup: $BACKUP_FILE"

# --------------------------------------------------
# 2. CREATE FAST BACKUP (Uncompressed tar for speed)
# --------------------------------------------------
tar --warning=no-file-changed \
    --null \
    -T "$FILE_LIST" \
    -cf "$BACKUP_FILE"

# Ensure backup was created and is not empty
if [ ! -s "$BACKUP_FILE" ]; then
    echo "ERROR: Backup creation failed or file is empty."
    echo "ABORTING DELETION TO PREVENT DATA LOSS."
    exit 1
fi

BACKUP_SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
echo "Backup created successfully (Size: $BACKUP_SIZE)."

# --------------------------------------------------
# 3. DELETE FILES FROM STORAGE
# --------------------------------------------------
echo "Deleting $FILE_COUNT files..."
xargs -0 -r rm -f -- < "$FILE_LIST"
echo "Files deleted successfully."

# --------------------------------------------------
# 4. REMOVE EMPTY SUBDIRECTORIES
# --------------------------------------------------
echo "Cleaning empty directories..."
for dir in "${VALID_DIRS[@]}"; do
    find "$dir" -mindepth 1 -type d -empty -delete
done
echo "Empty directories cleaned."

# --------------------------------------------------
# 5. DELETE PREVIOUS BACKUPS (Keep ONLY the latest one)
# --------------------------------------------------
echo "Cleaning up previous backups..."
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name "orders-backup-*.tar" -o -name "orders-backup-*.tar.gz" \) ! -name "$(basename "$BACKUP_FILE")" -delete
echo "Previous backups deleted. Only latest backup kept: $(basename "$BACKUP_FILE")"

echo "Cleanup completed successfully: $(date)"
echo "===================================================add" 
