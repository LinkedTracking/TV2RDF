'use strict';

const chai     = require('chai'),
      should   = chai.should(),
      LRUCache = require('../../lib/cache/LRUCache');

describe('LRUCache', () => {
  describe('construct', () => {
    it('should create an internal cache', () => {
      let cache = new LRUCache(10);
      cache.should.have.property('_cache');
    });
  });

  describe('get', () => {
    var cache;
    beforeEach(() => {
      cache = new LRUCache(1);
      cache.put('key1', 'val1');
    });

    it('should return undefined for non-existing key', () => {
      should.equal(cache.get('invalid'), undefined);
    });

    it('should return undefined for removed entry', () => {
      cache.put('key2', 'val2');
      should.equal(cache.get('key1'), undefined);
    });

    it('should find an existing key', () => {
      cache.get('key1').should.equal('val1');
    });
  });

  describe('put', () => {
    beforeEach(() => {
      var cache;
      beforeEach(() => {
        cache = new LRUCache(1);
        cache.put('key1', 'val1');
      });

      it('should add a new element', () => {
        cache.put('key2', 'val2');
        cache.get('key2').should.equal('val2');
      });

      it('should add overwrite an existing element', () => {
        cache.put('key1', 'val2');
        cache.get('key1').should.equal('val2');
      });
    });
  });
});
