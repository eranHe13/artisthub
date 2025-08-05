#!/usr/bin/env python3
"""
Script to update artist's minimum price for testing
"""

import sqlite3
import os

def update_artist_min_price(user_id: int, new_min_price: float):
    """Update artist's minimum price"""
    
    # Get the database path
    db_path = "app/core/data/database.db"
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Update the artist's minimum price
        cursor.execute(
            "UPDATE artist_profiles SET min_price = ? WHERE user_id = ?",
            (new_min_price, user_id)
        )
        
        if cursor.rowcount > 0:
            print(f"✅ Updated artist {user_id} minimum price to {new_min_price}")
        else:
            print(f"❌ No artist found with user_id {user_id}")
        
        # Commit changes
        conn.commit()
        
    except Exception as e:
        print(f"❌ Update failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    # Update artist with user_id 1 to have minimum price of 100 USD
    update_artist_min_price(1, 100.0) 