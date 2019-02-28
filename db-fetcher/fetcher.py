import threading
import mysql.connector
import time
import sys
import datetime


# https://docs.python.org/3/library/http.client.html#examples
# example making http calls
import http.client, urllib.parse
import json
def makeHTTPCall():
    conn = http.client.HTTPConnection("google.com")
    conn.request("POST", "")
    #conn.request("GET", "")
    response = conn.getresponse()
    data = response.read().decode('utf-8')
    conn.close()
    return data

#print(makeHTTPCall())

def getLast50Node(userID):

    #TODO do this without using the server - link directly to spotify
    url = 'trackrecord.shawnrast.com'
    conn = http.client.HTTPConnection(url)
    conn.request("GET", "/users/" + userID + "/last50RAW")
    response = conn.getresponse()
    last50JSON = response.read().decode('utf-8')
    conn.close()
    last50 = json.loads(last50JSON)
    return last50


## Global helper functions
def getSecondsSinceEpoch(dateTime):
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (dateTime - epoch).total_seconds()

# DB class modified from https://stackoverflow.com/a/982873
class DB:
    conn = None

    def connect(self):

        dbConfig = {
            "database": "TrackRecord",
            "host": "192.168.1.2",
            "user": sys.argv[1],
            "password": sys.argv[2]
        }
        try:
            # uncomment pool arguments if making a pool
            self.conn = mysql.connector.connect(
                #pool_name = "pool",
                #pool_size = 3,
                **dbConfig
            )
        except Exception as err:
            print("exception")
            print(err)
            raise err


    def query(self, sql):
        try:
            cursor = self.conn.cursor(buffered=True)
            cursor.execute(sql)
        except Exception as err:  # (AttributeError, MySQLdb.OperationalError):
            print("Query err")
            print(err)
            self.connect()
            cursor = self.conn.cursor(buffered=True)
            cursor.execute(sql)
        return cursor



class Job:
    target = {}
    args = []

    def __init__(self, target, args):
        #thread = threading.Thread(target=checkLocalDB, args=([i]))
        self.target = target
        
        self.args = args

    def execute(self):
        thread = threading.Thread(target=self.target, args=self.args)
        thread.start()

        # if len(self.args) > 0:
        #     self.target(self.args[0])
        # else:
        #     self.target()

class TimedJob:
    def __init__(self, job, time):
        self.job = job
        self.time = time

    def __lt__(self, other):
        if isinstance(other, TimedJob):
            return self.time < other.time
        else:
            return False  # maybe throw error instead?
    
    def execute(self):
        self.job.execute()



class SelfSort:
    def __init__(self):
        self.arr = []

    def __str__(self):
        return str(self.arr)

    def __getitem__(self, index):
        return self.arr[index]

    def __iter__(self):
        return iter(self.arr)

    def enqueue(self, newValue):
        # insertion sort... values likely start at back,
        # but we need to copy array anyway, so we're starting at front
        newArr = [None] * (len(self.arr) + 1)
        oldArrIndex = 0
        for val in self.arr:
            
            if newValue < val:
                break

            newArr[oldArrIndex] = self.arr[oldArrIndex]
            oldArrIndex += 1

        newArr[oldArrIndex] = newValue

        for i in range(oldArrIndex, len(self.arr)):
            newArr[i+1] = self.arr[i]

        self.arr = newArr

def getMostRecentSavedListen(userID):
    query = "SELECT PlayedAt FROM Listens WHERE "
    query += "GoogleUserID='" + userID + "'"
    query += "ORDER BY PlayedAt DESC"
    # query += "AND PlayedAt AFTER X"
    # TODO change query so that it only reads from a specified date

    dbSemaphore.acquire()

    listens = db.query(query)
    #users = db.query("Select GoogleUserID from Users")
    dbSemaphore.release()

    return listens


def addLast50ToDatabase(userID):
    # if error in getting http request, call refresh... maybe from web server
    # make an http call to /user/:userID/last50RAW
    # convert json 


    # Database ignores duplicates using "insert ignore"

    mostRecentListenTimestamp = getMostRecentSavedListen(userID)
    if mostRecentListenTimestamp.rowcount < 1:
        print("EMPTY SET")
        mostRecentListenTimestamp = 0
    else:
        mostRecentListenTimestamp = mostRecentListenTimestamp.fetchone()[0]
        mostRecentListenTimestamp = getSecondsSinceEpoch(mostRecentListenTimestamp)

    last50 = getLast50Node(userID)

    

    items = last50['items']
    itemsToAdd = []
    for item in items:

        try:
            timestamp = getSecondsSinceEpoch(datetime.datetime.strptime(item['played_at'], '%Y-%m-%dT%H:%M:%S.%fZ'))
        except Exception as e:
            datetime.datetime.strptime(item['played_at'], '%Y-%m-%dT%H:%M:%SZ')

        
        if timestamp <= mostRecentListenTimestamp+1:
            # This listen is already recorded in the database
            continue
        else:
            #print(item['track']['name'], item['track']['id'], item['played_at'])
            itemsToAdd.append(item)


    # add the new stuff to the db
    if len(itemsToAdd) > 0:
        dbSemaphore.acquire()
        insertIgnoreQuery = "INSERT IGNORE INTO Listens(GoogleUserID, SpotifyTrackID, PlayedAt) VALUES "
        for item in itemsToAdd:
            valueString = "('%s', '%s', '%s')," % (userID, item['track']['id'], item['played_at'])
            insertIgnoreQuery += valueString
        insertIgnoreQuery = insertIgnoreQuery[:-1] + ';'

        db.query(insertIgnoreQuery)
        db.conn.commit()
        dbSemaphore.release()
        

def checkLocalDB():
    dbSemaphore.acquire()

    users = db.query("Select GoogleUserID, NextHistoryUpdate from Users")
    #users = db.query("Select GoogleUserID from Users")

    overdue = []
    now = time.time()
    for user in users:

        userTime = getSecondsSinceEpoch(user[1])
        userID = user[0]

        if userTime < now:
            job = Job(addLast50ToDatabase, [user[0]])
            overdue.append(job)
        else:
            job = Job(addLast50ToDatabase, [user[0]])
            timedJob = TimedJob(job, userTime)
            queue.enqueue(timedJob)

        # enqueue overdue calls in batches of 5
        numExtraSeconds = 1
        for i in range(0, len(overdue)):
            job = overdue[i]
            timedJob = TimedJob(job, now + numExtraSeconds)
            queue.enqueue(timedJob)
            if i%5 == 0:
                numExtraSeconds += 1

        
    dbSemaphore.release()

    # enqueue this same function again
    thisFunction = Job(checkLocalDB, [])
    timedThis = TimedJob(thisFunction, time.time() + 600) ##TODO change from 5 seconds to 25 mins
    queue.enqueue(timedThis)
    
    # readFromDB()
    # .then(
    # enqueue all overdue api calls in batches
    # add all future calls to the queue
    # queue.add(checkLocalDB)

def loop():
    currentTime = time.time()

    for job in queue:
        if job.time < currentTime:
            job.execute()

            # remove job from queue
            queue.arr = [job for job in queue.arr if not (job.time < currentTime)]
        else:
            # queue is sorted, so we can skip forward
            break
    


db = DB()
db.connect()

maxConnections = 1
dbSemaphore = threading.BoundedSemaphore(maxConnections)

queue = SelfSort()  # make a self-sorting queue by time




# for i in range(0, 15):
#     checkLocalDB(i)


# this gets the 25-min db check interval going
checkLocalDB()


while True:
    loop()
    #time.sleep(1)
