let queue = [];

module.exports = function() {

    this.shuttingDown = false;

    this.addRepeatingFunction = function(prom, args, interval){
        return prom(args).then((response) => {
            window.setTimeout()
        });

        

            // queue.push(new Promise((resolve, reject) => {
            //     window.setTimeout(() => {
            //             this.addRepeatingFunction(func, interval);
            //         }).catch((err) => {
            //             reject(err);
            //         });
            //     }, interval);
            // });
    };
};

/*

getQueue();
// tasks are either refresh or get50

// should I auto-refresh if token is expired? 
addTask(promise, timeout);
