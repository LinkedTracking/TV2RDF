'use strict';

const Cache = require('./Cache'),
      LRU = require('lru-cache');

/**
 * A LRU implementation of a cache,
 * currently wraps around an lru-cache cache.
 */
class LRUCache extends Cache {
  constructor(size) {
    super();

    this._cache = LRU(size);
  }

  get(key) {
    return this._cache.get(key);
  }

  put(key, value) {
    return this._cache.set(key, value);
  }
}

module.exports = LRUCache;
