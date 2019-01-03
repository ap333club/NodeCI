const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');  //using this to promisy the get functon
// const redisUrl = 'redis://127.0.0.1:6379';
// const client = redis.createClient(redisUrl);
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
//promisfy client.get function
// client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);
//overwrite existing function, let's get a ref to it
const exec = mongoose.Query.prototype.exec;

// mongoose.Query.prototype.cache = function () {
//     console.log('setting cache');
//     this.useCache = true;
//     return this;
// }

mongoose.Query.prototype.cache = function (options = {}) {
    console.log('setting cache');
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

//do not use arrow functions in exec function below,
// arrow function will mess around 
// with the value of "this" insiode the function
mongoose.Query.prototype.exec = async function () {
    console.log('useCache flag:', this.useCache);
    if (!this.useCache) {
        console.log('NOT USING CACHE');
        return exec.apply(this, arguments);
        // let res=  await exec.apply(this, arguments);
        // console.log(res);
        // return res;
    }

    // doing object.assign because we do not want to 
    // modify the getQuery
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    // see if we have value for key in redis
    // const cacheValue = await client.get(key);
    const cacheValue = await client.hget(this.hashKey, key);
    // if so, return
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        //aray or single record
        //hydrating arrays!!
        // Array.isArray(doc) ?  it's an array : it's an Object;
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }
    // else, issue query and store result
    const result = await exec.apply(this, arguments);
    // console.log(result);
    // client.set(key, JSON.stringify(result), 'EX', 10);
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    // The 10 second expire doesn't seem to be working with HSET. Also, would it be a good idea, to add an "expireTime" option in the cache() function?

    // Kevin  · 9 months ago 
    // I fixed the HSET error by replacing the hset line with:

    // client.hset(this.hashKey, key, JSON.stringify(result));
    // client.expire(this.hashKey, 10);


    // Benjamin  · 6 months ago 
    // I had to add an empty callback to fix HSET error I was getting.



    // client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10, () => {}) 

    // seems to work. 

    // what i was wondering is why why promisify the hget but not the hset. 

    // because we are not going to use await with hset. in other words we don't need to use promises for hset because we don't really care about the return value of hset
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}

