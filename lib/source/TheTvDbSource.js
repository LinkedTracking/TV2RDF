'use strict';

var Source   = require('./Source'),
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
            id: serie.get('id').text(),
            name: serie.get('SeriesName').text(),
            description: serie.get('Overview').text()
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

  getAllSeries(options, cb) {
    throw new Error('getAllSeries has not been implemented');
  }

  getSeries(seriesName, cb) {
    throw new Error('getSeries has not been implemented');
  }

  getAllSeriesSeasons(seriesName, options, cb) {
    throw new Error('getAllSeriesSeasons has not been implemented');
  }

  getSeriesSeason(seriesName, seasonId, cb) {
    throw new Error('getSeriesSeason has not been implemented');
  }

  getAllSeriesEpisodes(seriesName, seasonId, options, cb) {
    throw new Error('getAllSeriesEpisodes has not been implemented');
  }

  getSeriesEpisode(seriesName, seasonId, episodeId, cb) {
    if (!seriesName || !episodeId) {
      throw new Error('seriesName and episodeId are required arguments.');
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
            var episodes = o.find('//Data/Episode[EpisodeNumber = "' + episodeId + '"' + (seasonId && seasonId >= 0 ? ' and SeasonNumber = "' + seasonId + '"' : '') + ']');
            if (!episodes) {
              cb(null, 'API result was invalid.');
            } else {
              episodes.forEach(episode => {
                cb({
                  episodeNumber: episode.get('EpisodeNumber').text(),
                  datePublished: episode.get('FirstAired').text(),
                  description: episode.get('Overview').text(),
                  name: episode.get('EpisodeName').text()
                });
              });
              cb(null);
            }
          } else {
            cb(null, 'API result was empty.');
          }
        });
      }
    });
  }
}

module.exports = TheTvDbSource;