import mysql.connector
#Extablishing connection
connection = mysql.connector.connect(
    host = "your_host",
    user = "your_user",
    password = "your_password",
    database = "your_database"
)

#performing a basic query

cursor = connection.cursor()
cursor.execute("SELECT * FROM your_table")
result = cursor.fetchall()

#closing the connection

connection.close()