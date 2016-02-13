/**
 * A Cache can store values to key.
 * @returns {Cache}
 * @constructor
 */
function Cache() {
  if(!(this instanceof Cache)) {
    return new Cache();
  }
}

/**
 * Get the value for the given key.
 * @param key The key.
 * @return The corresponding value.
 */
Cache.prototype.get = function(key) {
  throw new Error('get has not been implemented');
};

/**
 * Place the given key-value in the cache.
 * @param key The key.
 * @param value The corresponding value.
 */
Cache.prototype.put = function(key, value) {
  throw new Error('put has not been implemented');
};
