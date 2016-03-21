"use strict";
var Warlock = require('node-redis-warlock');
var LockStore_1 = require('./lib/LockStore');
var debugLib = require('debug');
var debug = debugLib('range-lock');
function RangeLock(redisClient, storeURL) {
    if (!redisClient) {
        throw new Error('You must provide a redis client as the first parameter to RangeLock()');
    }
    debug("Initialising RangeLock with storeURL=" + storeURL);
    this.warlock = Warlock(redisClient);
    this.store = new LockStore_1.default(storeURL);
}
;
RangeLock.prototype.processLock = function processLock(key, cb) {
    var warlockKey = "range-lock::" + key;
    var ttl = 1000;
    var maxAttempts = 20;
    var wait = 100;
    this.warlock.optimistic(warlockKey, ttl, maxAttempts, wait, function (err, unlock) {
        if (err) {
            return cb(err);
        }
        debug("warlock locked key=" + warlockKey);
        cb(null, unlock);
    });
};
RangeLock.prototype.set = function set(key, from, to, data, ttl, cb) {
    var self = this;
    self.processLock(key, function (err, unlock) {
        if (err) {
            debug("set::processLock got error for key=" + key);
            return cb(err);
        }
        self.store.find(key, from, to, function (err, results) {
            if (err) {
                unlock();
                debug("set::store.find got error for key=" + key);
                return cb(err);
            }
            if (results.length > 0) {
                unlock();
                var lock = results[0];
                lock.release = self.clear.bind(self, key, lock.id);
                return cb(null, false, lock);
            }
            self.store.create(key, from, to, data, ttl, function (err, lock) {
                if (err) {
                    unlock();
                    debug("set::store.create got error for key=" + key);
                    return cb(err);
                }
                lock.release = self.clear.bind(self, key, lock.id);
                cb(null, true, lock);
                unlock();
            });
        });
    });
};
RangeLock.prototype.get = function get(key, lockID, cb) {
    var self = this;
    self.processLock(key, function (err, unlock) {
        if (err) {
            debug("get::processLock got error for key=" + key);
            return cb(err);
        }
        self.store.get(key, lockID, function (err, lock) {
            unlock();
            if (lock)
                lock.release = self.clear.bind(self, key, lock.id);
            cb(err, lock);
        });
    });
};
RangeLock.prototype.clear = function invalidate(key, lockID, cb) {
    var self = this;
    self.processLock(key, function (err, unlock) {
        if (err) {
            debug("invalidate::processLock got error for key=" + key);
            return cb(err);
        }
        self.store.remove(key, lockID, function (err) {
            unlock();
            cb(err);
        });
    });
};
module.exports = RangeLock;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDOUMsMEJBQXNCLGlCQUFpQixDQUFDLENBQUE7QUFFeEMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUVyQyxtQkFBbUIsV0FBVyxFQUFFLFFBQVE7SUFDcEMsRUFBRSxDQUFBLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFRCxLQUFLLENBQUMsMENBQXdDLFFBQVUsQ0FBQyxDQUFDO0lBRTFELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxtQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFBQSxDQUFDO0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcscUJBQXFCLEdBQUcsRUFBRSxFQUFFO0lBRTFELElBQU0sVUFBVSxHQUFHLGlCQUFlLEdBQUssQ0FBQztJQUN4QyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUM7SUFDakIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBQyxHQUFHLEVBQUUsTUFBTTtRQUNwRSxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRUwsTUFBTSxDQUFDLEVBQUUs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