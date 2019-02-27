import threading
import mysql.connector
import time
import sys
import datetime


# https://docs.python.org/3/library/http.client.html#examples
# example making http calls
import http.client, urllib.parse
def makeHTTPCall():
    conn = http.client.HTTPConnection("google.com")
    conn.request("POST", "")
    #conn.request("GET", "")
    response = conn.getresponse()
    data = response.read().decode('utf-8')
    conn.close()
    return data

print(makeHTTPCall())

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
            cursor = self.conn.cursor()
            cursor.execute(sql)
        except Exception as err:  # (AttributeError, MySQLdb.OperationalError):
            print("Query err")
            print(err)
            self.connect()
            cursor = self.conn.cursor()
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

def pollLast50(userID):
    # make an http call to /user/:userID/last50RAW
    # convert json 

    # if error in getting http request, call refresh... maybe from web server
    print("%s" % (userID))

def checkLocalDB():
    dbSemaphore.acquire()

    users = db.query("Select GoogleUserID, NextHistoryUpdate from Users")
    #users = db.query("Select GoogleUserID from Users")

    for user in users:
        print(time.time())
        print(getSecondsSinceEpoch(user[1]))
        job = Job(pollLast50, [user[0]])
        timedJob = TimedJob(job, time.time())
        queue.enqueue(timedJob)
    dbSemaphore.release()

    # enqueue this same function again
    thisFunction = Job(checkLocalDB, [])
    timedThis = TimedJob(thisFunction, time.time() + 5)
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
