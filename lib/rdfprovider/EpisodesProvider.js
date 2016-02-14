'use strict';

var util        = require('../Util'),
    n3          = require('n3').Util,
    RdfProvider = require('./RdfProvider');

var prefixes = util.prefixes;

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

  hasTriples(subject, predicate, object) {
    return (!predicate || this.predicates.indexOf(predicate) >= 0) && (!subject || util.isValidNumber(util.parseTvUri(subject).episode));
  }

  getTriples(subject, predicate, object, options, cb) {
    // TODO: use options
    var uriData = util.parseTvUri(subject);
    var pattern = util.newTriple(subject, predicate, object);

    // Manual hack to make sure patterns like (null, 'http://schema.org/partOfSeason', "http://data.linkedtracking.org/series/Lost/1/1") work
    if(!uriData.seriesName && predicate && object && predicate == prefixes.schema + "partOfSeason") {
      var uriData2 = util.parseTvUri(object);
      uriData.seriesName = uriData2.seriesName;
      uriData.season = uriData2.season;
    }

    this._source.getSeriesEpisodes(uriData.seriesName, uriData.season, uriData.episode, {}, (episode, error) => {
      if (error) {
        cb(null, error);
      } else if (episode) {
        var seriesSubject = prefixes.lt + encodeURIComponent(episode.series.name);
        var seasonSubject = seriesSubject + "/" + encodeURIComponent(episode.seasonNumber);
        var episodeSubject = seasonSubject + "/" + encodeURIComponent(episode.episodeNumber);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'partOfSeason', seasonSubject), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.rdf + 'type', prefixes.schema + 'TVEpisode'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'name', '\"' + episode.name + '\"'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'description', '\"' + episode.description + '\"'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'episodeNumber', '\"' + episode.episodeNumber + '\"^^' + prefixes.xsd + 'integer'), pattern, cb);
        this._emitConditionalPredicate(
            util.newTriple(episodeSubject, prefixes.schema + 'datePublished', '\"' + episode.datePublished + '\"^^' + prefixes.xsd + 'date'), pattern, cb);
      } else {
        cb(null);
      }
    });
  }
}

module.exports = EpisodesProvider;