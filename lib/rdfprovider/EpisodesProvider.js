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
 * An EpisodesProvider provides information about series.
 */
class EpisodesProvider extends RdfProvider {

  constructor(source) {
    super(source);
    this.predicates = [
      prefixes.schema + 'episodeNumber',
      prefixes.schema + 'partOfSeason',
      prefixes.schema + 'datePublished',
      prefixes.schema + 'description',
      prefixes.schema + 'name',
      prefixes.rdf    + 'type'
    ];
  }

  hasTriples(subject, predicate, object) { // TODO: improve subject check
    return (!predicate || this.predicates.indexOf(predicate) >= 0) && (!subject || subject.indexOf(prefixes.lt) == 0);
  }

  getTriples(subject, predicate, object, options, cb) {
    // TODO: use options
    var seriesName, season, episode;
    if(subject && subject.indexOf(prefixes.lt) == 0) {
      var path = subject.substr(prefixes.lt.length, subject.length);
      var split = path.split("/");
      if(split.length >= 1) seriesName = split[0];
      if(split.length >= 2) season = parseInt(split[1]);
      if(split.length >= 3) episode = parseInt(split[2]);
    }
    var pattern = util.newTriple(subject, predicate, object);
    this._source.getSeriesEpisodes(seriesName, season, episode, {}, (episodeData, error) => {
      if (error) {
        cb(null, error);
      } else if (episodeData) {
        var seriesSubject = prefixes.lt + encodeURIComponent(episodeData.series.name);
        var seasonSubject = seriesSubject + "/" + encodeURIComponent(episodeData.seasonNumber);
        var episodeSubject = seasonSubject + "/" + encodeURIComponent(episodeData.episodeNumber);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'partOfSeason', seasonSubject), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.rdf + 'type', prefixes.schema + 'TVEpisode'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'name', '\"' + episodeData.name + '\"'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'description', '\"' + episodeData.description + '\"'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'episodeNumber', '\"' + episodeData.episodeNumber + '\"^^' + prefixes.xsd + 'integer'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'datePublished', '\"' + episodeData.datePublished + '\"^^' + prefixes.xsd + 'date'), pattern, cb);
      } else {
        cb(null);
      }
    });
  }
}

module.exports = EpisodesProvider;