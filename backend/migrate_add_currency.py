#!/usr/bin/env python3
"""
Migration script to add currency column to artist_profiles table
"""

import sqlite3
import os

def migrate_add_currency():
    """Add currency column to artist_profiles table"""
    
    # Get the database path
    db_path = "app/core/data/database.db"
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if currency column already exists
        cursor.execute("PRAGMA table_info(artist_profiles)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'currency' not in columns:
            # Add currency column with default value
            cursor.execute("ALTER TABLE artist_profiles ADD COLUMN currency TEXT DEFAULT 'USD'")
            print("✅ Added currency column to artist_profiles table")
        else:
            print("ℹ️  Currency column already exists")
        
        # Commit changes
        conn.commit()
        print("✅ Migration completed successfully")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_add_currency() 