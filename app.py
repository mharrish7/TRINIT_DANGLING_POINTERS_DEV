from flask import Flask,request,render_template,redirect,session,jsonify
import requests
import sqlite3
import hashlib

con = sqlite3.connect('test.db')
cursor = con.cursor()

cursor.execute('create table if not exists User(username varchar, password varchar)')
cursor.execute('create table if not exists UserData(username varchar, domain varchar, emission varchar, session varchar)')
# cursor.execute('create table if not exists Domains(domain varchar, emissionRate varchar, session varchar)')
con.close()


app = Flask(__name__)
app.secret_key = 'harrish07'

@app.route('/')
def home():
    con = sqlite3.connect('test.db')
    cursor = con.cursor()
    domain = {}
    cursor.execute("select * from UserData")
    for row in cursor:
        if row[0] in domain:
            domain[row[1]] += row[2]
        else:
            domain[row[1]] = row[2]
    L = []

    for i in domain:
        cursor.execute(f'select * from UserData where domain = "{i}"')
        l = 0
        for r in cursor:
            l+=1 
        r2 = round((int(domain[i])*308 * 442)/(l* (2**30)),3)
        color = ""
        if r2/l > 10:
            color = "red"
        elif r2/l > 5:
            color = "orange"
        else:
            color = "green"
         
        L.append([r2,i,color])
    L.sort() 
    return render_template('index.html', data = L)

@app.route("/session/<sessionId>")
def getSessionInfo(sessionId):

    con = sqlite3.connect('test.db')
    cursor = con.cursor()
    if(session.get('currentUser')):
        cursor.execute(f'select * from UserData where username = "{session["currentUser"]}" and session = "{sessionId}"')
        L = []
        for i in cursor:
            L.append(i)
        return render_template("sessionStat.html",data = L)
    else:
        return ("Logged IN USER")

@app.route("/userStats")
def userStats():
    con = sqlite3.connect('test.db')
    cursor = con.cursor()
    domain = {}
    cursor.execute(f'select * from UserData where username = {session["currentUser"]}')

    L = []
    for i in cursor:
        L.append(i)
    d={}
    for i in L:
        if i[3] in d:
            d[i[3]]+= int(i[2])
        else:
            d[i[3]] = int(i[2])
    K=[]
    ind = 1
    for i in d:
        print(d)
        r2 = round((int(d[i])*308 * 442)/(2**30),3)
        K.append([i,d[i],str(ind),r2])
        ind+=1 
    print(K)
    return render_template("userStats.html", data = K)

@app.route('/login',methods = ['POST','GET'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    if request.method == 'POST':
        # try:
            data = eval(request.data)
            name = data['username']
            passwd = data['password']
            password = hashlib.md5(passwd.encode())
            password=password.hexdigest()
            con = sqlite3.connect('test.db')
            cursor = con.cursor()
            cursor.execute(f'select * from User where username = "{name}"')
            pas = ""
            for i in cursor:
                pas = i[1]
            con.commit()
            con.close()
            if (pas==password):  
                session["currentUser"] = name  
                return jsonify(({"data": True}))
            else:
                return jsonify(({"data": False}))
        # except:
            con.close()
            return jsonify(({"data": 0}))   
    return render_template('login.html')

@app.route('/signup', methods = ['POST', 'GET'])
def signup():
    if request.method == 'GET':
        return render_template('signup.html')
    if request.method == 'POST':
            data = eval(request.data)
            passwd = data['password']
            name = data['username']
            print(name)
            password = hashlib.md5(passwd.encode())
            password=password.hexdigest()
            con = sqlite3.connect('test.db')
            cursor = con.cursor()
            cursor.execute(f'select `username` from User where username = "{name}"')
            data = cursor.fetchall()
            if(not data):
                cursor.execute(f'insert into User values("{name}","{password}")')
            con.commit()
            con.close()
            return jsonify(({"data": True}))

            con.close()
            return jsonify(({"data": False}))


@app.route('/getCurWebsite', methods = ['POST','GET'])
def curWebsite():
    data = eval(request.data)
    domain = data["domain"]
    con = sqlite3.connect('test.db')
    cursor = con.cursor()
    cursor.execute(f'select * from UserData where domain = "{domain}"')
    emission = []
    for i in cursor:
        emission.append(int(i[2]))

    if emission == []:
        return jsonify({"data" : "Website has no previous record"})
    else:
        return jsonify({"data" : sum(emission)})
    

@app.route('/getData', methods = ['POST','GET'])
def sendData():
    data = eval(request.data)
    user = data["user"]
    con = sqlite3.connect('test.db')
    cursor = con.cursor()
    List = []
    cursor.execute(f'select * from UserData where username = "{user}"')
    for rows in cursor:
        List.append([rows[1],rows[2]])
    
    return jsonify({"data" : List})
    


@app.route('/sendData', methods = ['POST','GET'])
def storedata():
    data = eval(request.data)
    print(data["user"],data["data"])
    
    con = sqlite3.connect('test.db')
    cursor = con.cursor()
    
    cursor.execute(f'select * from UserData where session = "{data["session"]}"')
    for rows in cursor:
        print(rows)
    #Protect session ! 

    # for i in data["data"]:
    #     cursor.execute(f'select * from Domains where domain = "{i}"')
    #     exist = None
    #     for r in cursor:
    #         print(r)
    #         exist = r[1]

    #     if exist == None:
    #         cursor.execute(f'insert into Domains values("{i}","{data["data"][i]}", "{data["session"]}")')
    #     else:
    #         total = data["data"][i] + int(exist)
    #         cursor.execute(f'update Domains set emissionRate = "{total}" where domain = "{i}"')
    #     con.commit()
    for i in data["data"]:
        cursor.execute(f'select * from UserData where domain = "{i}" and session = "{data["session"]}"')
        exist = None
        for r in cursor:
            exist = r[0]
            break 
        if exist == None:
            cursor.execute(f'insert into UserData values("{data["user"]}","{i}","{data["data"][i]}","{data["session"]}")')
        else:
            cursor.execute(f'update UserData set emission = "{data["data"][i]}" where domain = "{i}" and session = "{data["session"]}"')
    con.commit()

    return jsonify({"success" : True})


@app.route("/getUser")
def getUser():
    try:
        if session.get("currentUser"):
            return jsonify({"data":session["currentUser"]})
        else:
            return jsonify({"data": False})
    except:
         return jsonify({"data": False})

if __name__ == '__main__':
    app.run(debug = True)