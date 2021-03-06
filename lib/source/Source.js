'use strict';

var http = require('http');

/**
 * A Source can output information related to series.
 */
class Source {
  /**
   * Creates a new source instance.
   * @param cache The cache this source can use.
   * @returns {Source}
   * @constructor
   */
  constructor(cache) {
    this._cache = cache;
  }

  /**
   * Get the full body of the given url.
   * @param url The url.
   * @param cb The callback (data, error).
   * @private
   */
  _getUrlContents(url, cb) {
    var body = this._cache.get(url) || '';
    if(body.length > 0) {
      cb(body);
    } else {
      http.get(url, res => {
        res.on('data', chunk => body += chunk);
        res.on('error', error => cb(null, error));
        res.on('end', ()    => {
          this._cache.put(url, body);
          cb(body);
        });
      });
    }
  }

  /**
   * Find all series matching the given name with a given offset and limit.
   * @param pattern A partial series string, can be undefined if searching for all.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  findSeries(seriesName, options, cb) {
    throw new Error('findSeries has not been implemented');
  }

  /**
   * Get the series matching the given name.
   * @param seriesName The optional name of the series, if undefined all seasons will be looped.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getSeries(seriesName, options, cb) {
    throw new Error('getSeries has not been implemented');
  }

  /**
   * Get the seasons of the given series of the given season id.
   * @param seriesName The name of the series.
   * @param seasonId The optional season id, if undefined all seasons will be looped.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getSeriesSeasons(seriesName, seasonId, options, cb) {
    throw new Error('getSeriesSeasons has not been implemented');
  }

  /**
   * Get the seasons of the given series of the given season id.
   * @param seriesName The name of the series.
   * @param seasonId The optional season id, if undefined all seasons will be looped.
   * @param episodeId The optional episode id, if undefined all episodes will be looped.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getSeriesEpisodes(seriesName, seasonId, episodeId, options, cb) {
    throw new Error('getSeriesEpisodes has not been implemented');
  }
}

module.exports = Source;