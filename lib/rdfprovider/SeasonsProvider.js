'use strict';

var util        = require('../Util'),
    n3          = require('n3').Util,
    RdfProvider = require('./RdfProvider');

var prefixes = {
  lt: 'http://data.linkedtracking.org/series/',
  schema: 'http://schema.org/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
};

/**
 * A SeriesProvider provides information about series.
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
    return (!predicate || this.predicates.indexOf(predicate) >= 0) && (!subject || subject.indexOf(prefixes.lt) == 0);
  }

  getTriples(subject, predicate, object, options, cb) {
    // TODO: use options
    var seriesName, season;
    if(subject && subject.indexOf(prefixes.lt) == 0) {
      var path = subject.substr(prefixes.lt.length, subject.length);
      var split = path.split("/");
      if(split.length == 2) {
        seriesName = split[0];
        season = split[1];
      } else if (split.length == 1) {
        seriesName = split[0];
      }
    }
    var pattern = util.newTriple(subject, predicate, object);
    this._source.getSeriesSeasons(seriesName, season, {}, (season, error) => {
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