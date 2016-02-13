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
    if(!(this instanceof Source)) {
      return new Source(cache);
    }

    this._cache = cache;
  }

  /**
   * Find all series matching the given name with a given offset and limit.
   * @param name A partial series string, can be undefined if searching for all.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  findSeries(name, options, cb) {
    throw new Error('findSeries has not been implemented');
  }

  /**
   * Get all series with a given offset and limit.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getAllSeries(options, cb) {
    throw new Error('getAllSeries has not been implemented');
  }

  /**
   * Get the series matching the given name.
   * @param seriesName The name of the series.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getSeries(seriesName, cb) {
    throw new Error('getSeries has not been implemented');
  }

  /**
   * Get the seasons of the given series of the given season id.
   * @param seriesName The name of the series.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getAllSeriesSeasons(seriesName, options, cb) {
    throw new Error('getAllSeriesSeasons has not been implemented');
  }

  /**
   * Get the seasons of the given series of the given season id.
   * @param seriesName The name of the series.
   * @param seasonId The season id.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getSeriesSeason(seriesName, seasonId, cb) {
    throw new Error('getSeriesSeason has not been implemented');
  }

  /**
   * Get the seasons of the given series of the given season id.
   * @param seriesName The name of the series.
   * @param seasonId The optional season id, if undefined all seasons will be looped.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getAllSeriesEpisodes(seriesName, seasonId, options, cb) {
    throw new Error('getAllSeriesEpisodes has not been implemented');
  }

  /**
   * Get the seasons of the given series of the given season id.
   * @param seriesName The name of the series.
   * @param seasonId The optional season id, if undefined all seasons will be looped.
   * @param episodeId The episode id.
   * @param cb The callback, first argument is data, second argument is error.
   */
  getSeriesEpisode(seriesName, seasonId, episodeId, cb) {
    throw new Error('getSeriesEpisode has not been implemented');
  }
}
