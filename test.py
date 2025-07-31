import sqlite3

# 1. פתח חיבור ובצע את השאילתה
conn = sqlite3.connect("./backend/app/core/data/database.db")


cursor = conn.execute("SELECT * FROM users;")

# # 2. קבל את שמות העמודות
columns = [col[0] for col in cursor.description]

# # 3. קרא את כל השורות
rows = cursor.fetchall()

# # 4. הדפס כותרת עם שמות העמודות
print(" | ".join(columns))

# # 5. עבור כל שורה – הדפס את הערכים
for row in rows:
    print(" | ".join(str(val) for val in row))
conn.commit()

conn.close()




# # פתח חיבור
# conn = sqlite3.connect("./backend/app/core/data/database.db")
# cursor = conn.cursor()

# # 1. מחיקת כל הרשומות
# cursor.execute("DELETE FROM users;")

# # 2. שמירת השינויים (בלי זה השינויים לא יישמרו בקובץ)
# conn.commit()

# # 3. אופציונלי: הדפסת כמות הרשומות שנמחקו
# print(f"{cursor.rowcount} רשומות נמחקו מהטבלה users")

# # 4. סגירת החיבור
# conn.close()