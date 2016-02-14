'use strict';

var util        = require('../Util'),
    n3          = require('n3').Util,
    RdfProvider = require('./RdfProvider');

var prefixes = util.prefixes;

/**
 * A SeasonsProvider provides information about series.
 */
class SeasonsProvider extends RdfProvider {

  constructor(source) {
    super(source);
    this.predicates = [
      prefixes.schema + 'seasonNumber',
      prefixes.schema + 'containsSeason',
      prefixes.rdf    + 'type'
    ];
  }

  hasTriples(subject, predicate, object) {
    if((!predicate || this.predicates.indexOf(predicate) >= 0)) {
      if(!subject) return true;
      var uriData = util.parseTvUri(subject);
      return uriData.seriesName && !uriData.episode;
    }
    return false;
  }

  getTriples(subject, predicate, object, options, cb) {
    // TODO: use options
    var uriData = util.parseTvUri(subject);
    var pattern = util.newTriple(subject, predicate, object);
    this._source.getSeriesSeasons(uriData.seriesName, uriData.season, {}, (season, error) => {
      if (error) {
        cb(null, error);
      } else if (season) {
        var seriesSubject = prefixes.lt + encodeURIComponent(season.series.name);
        var seasonSubject = seriesSubject + "/" + encodeURIComponent(season.seasonNumber);
        this._emitConditionalPredicate(
            util.newTriple(seriesSubject, prefixes.schema + 'containsSeason', seasonSubject), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(seasonSubject, prefixes.rdf + 'type', prefixes.schema + 'TVSeason'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(seasonSubject, prefixes.schema + 'seasonNumber', '\"' + season.name + '\"^^' + prefixes.xsd + 'integer'), pattern, cb);
      } else {
        cb(null);
      }
    });
  }
}

module.exports = SeasonsProvider;