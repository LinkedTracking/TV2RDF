'use strict';

var Source   = require('./Source'),
    util     = require('../Util'),
    libxmljs = require("libxmljs");

/**
 * A TheTvDbSource is a Source that calls TheTVDB API. (http://thetvdb.com/wiki/index.php?title=Programmers_API)
 * TODO: cache all the things
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
   * Get all series with the given name.
   * @param seriesName The series name.
   * @param cb The callback.
   * @private
   */
  _getSeries(seriesName, cb) {
    if (!seriesName) {
      throw new Error('seriesName is a required argument.');
    }
    this._getUrlContents('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, (data, error) => {
      var o = libxmljs.parseXmlString(data);
      var series = o.find('//Data/Series');
      if (!series) {
        cb(null, 'API result was invalid.');
      } else {
        series.forEach(serie => {
          cb({
            id: util.getXmlNodeText(serie.get('id')),
            name: util.getXmlNodeText(serie.get('SeriesName')),
            description: util.getXmlNodeText(serie.get('Overview'))
          });
        });
        cb();
      }
    });
  }

  /**
   * Get the internal series id of the first series with the given name.
   * An error will be sent to the callback if no result could be found.
   * @param seriesName The series name.
   * @param cb The callback.
   * @private
   */
  _getSeriesId(seriesName, cb) {
    var sent = false;
    this._getSeries(seriesName, (data, error) => {
      if (error) {
        cb(null, error);
      } else if (!sent) {
        sent = true;
        if(!data) {
          cb(null, 'No series with the given name could be found.');
        } else {
          cb(data.id);
        }
      }
    });
  }

  findSeries(name, options, cb) {
    throw new Error('findSeries has not been implemented');
  }

  getSeries(seriesName, options, cb) {
    throw new Error('getSeries has not been implemented');
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
        cb(data.seasonNumber);
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
      cb(null, 'seriesName is a required argument.');
    }
    this._getSeriesId(seriesName, (seriesId, error) => {
      if(error) {
        cb(null, error);
      }
      if(seriesId) {
        this._getPage('series/' + seriesId + '/all', (data, error) => {
          if (error) {
            cb(null, error);
          } else if (data) {
            var o = libxmljs.parseXmlString(data);
            var episodes = o.find('//Data/Episode' + (xPathSelector ? '[' + xPathSelector + ']' : ''));
            if (!episodes) {
              cb(null, 'API result was invalid.');
            } else {
              cb(episodes);
            }
          } else {
            cb(null, 'API result was empty.');
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
    this._handleEpisodes(seriesName, util.xPathConditionBuilder(conditions), (episodes, error) => {
      if(error) {
        cb(null, error);
      } else {
        episodes = util.sliceWithOptions(episodes, options);
        episodes.forEach(episode => cb(util.episodeToObject(episode)));
        cb(null);
      }
    });
  }
}

module.exports = TheTvDbSource;