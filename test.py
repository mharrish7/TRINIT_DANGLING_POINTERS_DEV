import sqlite3

con = sqlite3.connect('test.db')

cursor = con.cursor()


cursor.execute('select * from UserData')
for i in cursor:
    print(i)


cursor.execute('select * from User')
for i in cursor:
    print(i)

con.commit()
con.close()