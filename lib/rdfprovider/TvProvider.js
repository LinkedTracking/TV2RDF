'use strict';

var util             = require('../Util'),
    n3               = require('n3').Util,
    RdfProvider      = require('./RdfProvider'),
    SeriesProvider   = require('./SeriesProvider'),
    SeasonsProvider  = require('./SeasonsProvider'),
    EpisodesProvider = require('./EpisodesProvider');

var prefixes = {
  lt: "http://data.linkedtracking.org/series/",
  schema: "http://schema.org/",
  xsd: 'http://www.w3.org/2001/XMLSchema#'
};

/**
 * A TvProvider provides information about series, seasons and episodes.
 */
class TvProvider extends RdfProvider {

  constructor(source) {
    super(source);
    this._subProviders = [
        new SeriesProvider(source),
        new SeasonsProvider(source),
        new EpisodesProvider(source)
    ]
  }

  hasTriples(subject, predicate, object) {
    for(var key in this._subProviders) {
      var provider = this._subProviders[key];
      if(provider.hasTriples(subject, predicate, object)) {
        return true;
      }
    }
    return false;
  }

  getTriples(subject, predicate, object, options, cb) {
    var barrier = 1;
    for(var key in this._subProviders) {
      var provider = this._subProviders[key];
      if(provider.hasTriples(subject, predicate, object)) {
        barrier++;
        provider.getTriples(subject, predicate, object, options, (triple, error) => {
          if(!triple && !error) {
            handleBarrier(cb);
          } else {
            cb(triple, error);
          }
        }); // TODO: use options
      }
    }
    handleBarrier(cb);

    function handleBarrier(cb) {
      if(--barrier == 0) {
        cb(null);
      }
    }
  }
}

module.exports = TvProvider;