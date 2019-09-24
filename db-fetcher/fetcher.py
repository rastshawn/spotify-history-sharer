import threading
import mysql.connector
import time
import sys # for reading args
import datetime
import http.client, urllib.parse
import json


############# Global helper functions

## Returns the the int number of seconds from epoch from a datetime obj
def getSecondsSinceEpoch(dateTime):
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (dateTime - epoch).total_seconds()

## returns a date equal to n mins from now
def nMinutesFromNow(n):
    now = datetime.datetime.now()
    plusN = now + datetime.timedelta(minutes=n)
    return plusN

############## Custom classes

## Wrapper for database that automatically reconnects on errors
class DB:
    # modified from https://stackoverflow.com/a/982873
    conn = None

    def connect(self):
        dbConfig = {
            "database": "TrackRecord",
            "host": "localhost",
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


## A grouping for functions and arguments that spawns a new thread when called
## Basically just a wrapper for threading.Thread
class Job:
    target = {}
    args = []

    def __init__(self, target, args):
        self.target = target
        self.args = args

    def execute(self):
        thread = threading.Thread(target=self.target, args=self.args)
        thread.start()

## Attaches a Job object to a time. 
## Is sortable with a comparator - sorts by time. Oldest first.
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


## A self-sorting queue. Uses whatever sort item the objects have on them. 
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




########### Functions

## This is what actually calls the spotify API, 
#   sees what songs are new in the history, 
#   and adds the new ones to the database. 
def addLast50ToDatabase(userID):
    # if error in getting http request, call refresh... maybe from web server
    # make an http call to /user/:userID/last50RAW
    # convert json 

    ## This gets the listen datetime of the last stored song in the db. 
    def getMostRecentSavedListen(userID):
        query = "SELECT PlayedAt FROM Listens WHERE "
        query += "GoogleUserID='" + userID + "'"
        query += "ORDER BY PlayedAt DESC"
        # query += "AND PlayedAt AFTER X"
        # TODO change query so that it only reads from a specified date

        dbSemaphore.acquire()
        listens = db.query(query)
        dbSemaphore.release()
        return listens

    ## This returns the last 50 songs a user listened to, by calling the existing server.
    ## This should be replaced. TODO
    def getLast50Node(userID):
        # https://docs.python.org/3/library/http.client.html#examples
        #TODO do this without using the server - link directly to spotify
        url = 'trackrecordlive.shawnrast.com'
        conn = http.client.HTTPConnection(url)
        conn.request("GET", "/users/" + userID + "/last50RAW")
        response = conn.getresponse()
        last50JSON = response.read().decode('utf-8')
        conn.close()
        last50 = json.loads(last50JSON)
        return last50

    def updateUserNextHistoryUpdateTime(userID):
        nextUpdate = str(nMinutesFromNow(5))
        query = "UPDATE Users SET NextHistoryUpdate = '" + nextUpdate
        query = query + "' WHERE GoogleUserID = '" + userID + "'"
        print(query)
        db.query(query)



    mostRecentListenTimestamp = getMostRecentSavedListen(userID)
    if mostRecentListenTimestamp.rowcount < 1:
        print("EMPTY SET")
        # Nothing is in the DB for this user - set the first listen time to 1970
        # This makes sure all the new records get added
        mostRecentListenTimestamp = 0
    else:
        ## Store the datetime obj from the database
        mostRecentListenTimestamp = mostRecentListenTimestamp.fetchone()[0]
        ## convert it into seconds
        mostRecentListenTimestamp = getSecondsSinceEpoch(mostRecentListenTimestamp)


    last50 = getLast50Node(userID)
    items = last50['items']
    itemsToAdd = []

    # reversed because the last50 from spotify is newest first
    for item in reversed(items):
        # Parse the timestamp for the listen from Spotify
        try:
            timestamp = getSecondsSinceEpoch(datetime.datetime.strptime(item['played_at'], '%Y-%m-%dT%H:%M:%S.%fZ'))
        except Exception as e:
            timestamp = getSecondsSinceEpoch(datetime.datetime.strptime(item['played_at'], '%Y-%m-%dT%H:%M:%SZ'))

        if timestamp <= mostRecentListenTimestamp+1:
            # This listen is already recorded in the database
            # Because it is older than the most recent db entry for this user
            continue
        else:
            # this listen needs to be entered into the db
            itemsToAdd.append(item)


    # add the new stuff to the db
    if len(itemsToAdd) > 0:
        dbSemaphore.acquire()
        ## INSERT IGNORE here because it truncates dates without complaining
        insertIgnoreQuery = "INSERT IGNORE INTO Listens(GoogleUserID, SpotifyTrackID, PlayedAt) VALUES "
        for item in itemsToAdd:
            valueString = "('%s', '%s', '%s')," % (userID, item['track']['id'], item['played_at'])
            insertIgnoreQuery += valueString
        insertIgnoreQuery = insertIgnoreQuery[:-1] + ';'

        # execute the query, then commit changes (they won't take hold without commit)
        db.query(insertIgnoreQuery)
        updateUserNextHistoryUpdateTime(userID)
        db.conn.commit() 
        dbSemaphore.release()

    ## Now we have to record that we checked the time for the user. 
    ## TODO
        

## Check the database to see what users are due for a new check, and enqueue required checks. 
## This gets run at the interval specified later on in the function. 
def checkLocalDB():
    dbSemaphore.acquire()

    users = db.query("Select GoogleUserID, NextHistoryUpdate from Users")
    
    overdue = []
    now = time.time()
    for user in users:

        if user[1] is None:
            timeOfNextCheck = 0
        else:
            timeOfNextCheck = getSecondsSinceEpoch(user[1])
        userID = user[0]

        #print("time of check: \t%s\nnow:\t\t%s" % (timeOfNextCheck, now))

        if timeOfNextCheck < now:
            job = Job(addLast50ToDatabase, [user[0]])
            overdue.append(job)
        else:
            job = Job(addLast50ToDatabase, [user[0]])
            timedJob = TimedJob(job, timeOfNextCheck)
            queue.enqueue(timedJob)

        # enqueue overdue calls in batches of 5, one second apart
        secondsToAdd = 1
        for i in range(0, len(overdue)):
            job = overdue[i]
            timedJob = TimedJob(job, now + secondsToAdd)
            queue.enqueue(timedJob)
            if i%5 == 0:
                secondsToAdd += 1

    ## Release the database - this ensures no information can change while the check is occurring
    dbSemaphore.release()

    # enqueue this same function again
    thisFunction = Job(checkLocalDB, [])
    timedThis = TimedJob(thisFunction, time.time() + 600) ##TODO change from 5 seconds to 25 mins
    queue.enqueue(timedThis)



###################### Start the app!

# Main app loop that checks the queue for jobs to run
def loop():
    currentTime = time.time()

    for job in queue:
        if job.time < currentTime:
            # remove job from queue
            queue.arr = [job for job in queue.arr if not (job.time < currentTime)]

            job.execute()


        else:
            # queue is sorted, so we can skip forward
            break

db = DB()
db.connect()
maxConnections = 1
dbSemaphore = threading.BoundedSemaphore(maxConnections)
queue = SelfSort()

# this gets the 25-min db check interval going
checkLocalDB()

while True:
    loop()
    #time.sleep(1) #let's make this wait one second between checks... should prevent multiples being entered
