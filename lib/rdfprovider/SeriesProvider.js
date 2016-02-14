'use strict';

var util        = require('../Util'),
    n3          = require('n3').Util,
    RdfProvider = require('./RdfProvider');

var prefixes = util.prefixes;

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
    if((!predicate || this.predicates.indexOf(predicate) >= 0)) {
      if(!subject) return true;
      var uriData = util.parseTvUri(subject);
      return uriData.seriesName && !uriData.season;
    }
    return false;
  }

  getTriples(subject, predicate, object, options, cb) {
    // TODO: use options
    var seriesName = util.parseTvUri(subject).seriesName;

    // Manual hack to make sure patterns like (null, 'http://schema.org/name', "\"Lost\"") work
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