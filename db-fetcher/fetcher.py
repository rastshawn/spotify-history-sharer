import threading
import mysql.connector
import time
import sys

# DB class from https://stackoverflow.com/a/982873
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


db = DB()
db.connect()

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
# test connect to db
# sql = "SELECT * FROM Users"
# cursor = db.query(sql)
# for row in cursor:
# print(row)


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



def loop():
    currentTime = time.time()

    for job in queue:
        if job.time < currentTime:
            job.execute()
            queue.arr = [job for job in queue.arr if not (job.time < currentTime)]
            continue
            # remove job from queue
            # run job in new thread

        else:
            # queue is sorted, so we can skip forward
            break
    

maxConnections = 1
dbSemaphore = threading.BoundedSemaphore(maxConnections)


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



queue = SelfSort()  # make a self-sorting queue by time


def pollLast50(userID, num):
    print("%s : %s" % (userID, num))

def checkLocalDB(num):
    dbSemaphore.acquire()
    users = db.query("Select GoogleUserID from Users")

    for user in users:
        job = Job(pollLast50, [user[0], num])
        timedJob = TimedJob(job, time.time() + num)
        queue.enqueue(timedJob)
    dbSemaphore.release()
    
    # readFromDB()
    # .then(
    # enqueue all overdue api calls in batches
    # add all future calls to the queue
    # queue.add(checkLocalDB)


for i in range(0, 15):
    #thread = threading.Thread(target=checkLocalDB, args=([i]))
    #thread = threading.Thread(target=checkLocalDB)
    #thread.start()
    checkLocalDB(i)
#newthread = threading.Thread(target=funcName, args=(2, 3, 4))



while True:
    loop()
