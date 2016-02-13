'use strict';

/**
 * A Cache can store values to keys.
 */
class Cache {
  /**
   * Creates a new cache instance
   * @returns {Cache}
   * @constructor
   */
  constructor() {
  }

  /**
   * Get the value for the given key.
   * @param key The key.
   * @return The corresponding value.
   */
  get(key) {
    throw new Error('get has not been implemented');
  }

  /**
   * Place the given key-value in the cache.
   * @param key The key.
   * @param value The corresponding value.
   */
  put(key, value) {
    throw new Error('put has not been implemented');
  }
}

module.exports = Cache;
