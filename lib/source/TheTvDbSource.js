'use strict';

var Source   = require('./Source'),
    util     = require('../Util'),
    libxmljs = require("libxmljs");

/**
 * A TheTvDbSource is a Source that calls TheTVDB API. (http://thetvdb.com/wiki/index.php?title=Programmers_API)
 */
class TheTvDbSource extends Source {
  /**
   * Creates a new source instance.
   * @param cache The cache this source can use.
   * @param options The options.
   * @returns {Source}
   * @constructor
   */
  constructor(cache, options) {
    super(cache);
    if(!options.apiKey) {
      throw new Error('apiKey is required in options.');
    }
    this._apiKey = options.apiKey;
  }

  /**
   * Get a page from the API.
   * This will automatically contain the API key.
   * @param page The page.
   * @param cb The callback.
   * @private
   */
  _getPage(page, cb) {
    this._getUrlContents('http://thetvdb.com/api/' + this._apiKey + '/' + page, cb);
  }

  /**
   * Get the internal series id of the first series with the given name.
   * An error will be sent to the callback if no result could be found.
   * @param seriesName The series name.
   * @param cb The callback.
   * @private
   */
  _getSeriesId(seriesName, cb) {
    var result = false;
    this.getSeries(seriesName, { limit: 1 }, (data, error) => {
      if (error) {
        cb(null, error);
      } else {
        if(!data && !result) {
          cb(null, 'No series with the given name could be found.');
        } else if(data) {
          result = true;
          cb(data);
        }
      }
    });
  }

  findSeries(pattern, options, cb) {
    getSeries(pattern, options, cb);
  }

  getSeries(seriesName, options, cb) {
    if (!seriesName) {
      throw new Error('seriesName is a required argument.');
    }
    if(!cb) { // Shift parameters if options are omitted
      cb = options;
      options = {};
    }
    this._getUrlContents('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, (data, error) => {
      if(error) {
        cb(null, error);
      }
      var o = libxmljs.parseXmlString(data);
      var series = o.find('//Data/Series');
      if (!series) {
        cb(null, 'API result was invalid.');
      } else {
        series = util.sliceWithOptions(series, options);
        series.forEach(serie => {
          cb({
            id: util.getXmlNodeText(serie.get('id')),
            name: util.getXmlNodeText(serie.get('SeriesName')),
            description: util.getXmlNodeText(serie.get('Overview')),
            datePublished: util.getXmlNodeText(serie.get('FirstAired'))
          });
        });
        cb();
      }
    });
  }

  getSeriesSeasons(seriesName, seasonId, options, cb) {
    if(!cb) { // Shift parameters if options are omitted
      cb = options;
      options = {};
    }
    var accumulatedSeasons = {};
    this.getSeriesEpisodes(seriesName, seasonId, null, options, (data, error) => {
      if (error) {
        cb(null, error);
      } else if (!data) {
        cb(null);
      } else if(!accumulatedSeasons[data.seasonNumber]) {
        accumulatedSeasons[data.seasonNumber] = true;
        cb({
          series: data.series,
          seasonNumber: data.seasonNumber
        });
      }
    });
  }

  /**
   * Get all episodes from the given series by the given selector.
   * A check will automatically be done for seriesName validity.
   * @param seriesName The series name.
   * @param xPathSelector The XPatch selector for selecting one episode, starting from the Element node.
   * @param cb The callback.
   * @private
   */
  _handleEpisodes(seriesName, xPathSelector, cb) {
    if (!seriesName) {
      cb(null, null, 'seriesName is a required argument.');
    }
    this._getSeriesId(seriesName, (series, error) => {
      if(error) {
        cb(null, null, error);
      }
      if(series) {
        this._getPage('series/' + series.id + '/all', (data, error) => {
          if (error) {
            cb(null, null, error);
          } else if (data) {
            var o = libxmljs.parseXmlString(data);
            var episodes = o.find('//Data/Episode' + (xPathSelector ? '[' + xPathSelector + ']' : ''));
            if (!episodes) {
              cb(null, null, 'API result was invalid.');
            } else {
              cb(episodes, series);
            }
          } else {
            cb(null, null, 'API result was empty.');
          }
        });
      }
    });
  }

  getSeriesEpisodes(seriesName, seasonId, episodeId, options, cb) {
    if(!cb) { // Shift parameters if options are omitted
      cb = options;
      options = {};
    }
    var conditions = {};
    if(util.isValidNumber(episodeId)) conditions['EpisodeNumber'] = episodeId;
    if(util.isValidNumber(seasonId )) conditions['SeasonNumber' ] = seasonId;
    this._handleEpisodes(seriesName, util.xPathConditionBuilder(conditions), (episodes, series, error) => {
      if(error) {
        cb(null, error);
      } else {
        episodes = util.sliceWithOptions(episodes, options);
        episodes.forEach(episode => cb(util.episodeToObject(episode, series)));
        cb(null);
      }
    });
  }
}

module.exports = TheTvDbSource;