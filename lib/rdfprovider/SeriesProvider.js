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
class SeriesProvider extends RdfProvider {

  constructor(source) {
    super(source);
    this.predicates = [
      prefixes.schema + 'datePublished',
      prefixes.schema + 'description',
      prefixes.schema + 'name',
      prefixes.rdf    + 'type'
    ];
  }

  hasTriples(subject, predicate, object) {
    return (!predicate || this.predicates.indexOf(predicate) >= 0) && (!subject || subject.indexOf(prefixes.lt) == 0);
  }

  getTriples(subject, predicate, object, options, cb) {
    // TODO: use options
    var seriesName = subject ? subject.replace(prefixes.lt, '') : null;
    if(!seriesName && predicate && object && predicate == prefixes.schema + "name") {
      seriesName = n3.getLiteralValue(object);
    }
    var pattern = util.newTriple(subject, predicate, object);
    this._source.getSeries(seriesName, {}, (series, error) => {
      if (error) {
        cb(null, error);
      } else if (series) {
        var seriesSubject = prefixes.lt + encodeURIComponent(series.name);
        this._emitConditionalPredicate(
            util.newTriple(seriesSubject, prefixes.rdf + 'type', prefixes.schema + 'TVSeries'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(seriesSubject, prefixes.schema + 'name', '\"' + series.name + '\"'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(seriesSubject, prefixes.schema + 'description', '\"' + series.description + '\"'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(seriesSubject, prefixes.schema + 'datePublished', '\"' + series.datePublished + '\"^^' + prefixes.xsd + 'date'), pattern, cb);
      } else {
        cb(null);
      }
    });
  }
}

module.exports = SeriesProvider;