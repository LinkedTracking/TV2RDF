'use strict';

class Util {

  constructor() {
    this.prefixes = {
      lt: 'http://data.linkedtracking.org/series/',
      schema: 'http://schema.org/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
    };
  }

  /**
   * Convert the given conditions map to an xPath condition.
   * @param conditions A map from xPath key to required value.
   * @returns {string} The xPath condition.
   */
  xPathConditionBuilder(conditions) {
    var condition = "";
    var first = true;
    for (var key in conditions) {
      var value = conditions[key];
      if(first) {
        first = false;
      } else {
        condition += " and ";
      }
      condition += key + " = \"" + value + "\"";
    }
    return condition;
  }

  /**
   * Safely get the nodetext from the given xml node.
   * @param node The node.
   * @returns The text or an empty string.
   */
  getXmlNodeText(node) {
    if (node) {
      return node.text();
    }
    return "";
  }

  /**
   * Helper function to check if something is a valid number.
   * @param number The value to check.
   * @returns {boolean} If it is a number.
   */
  isValidNumber(number) {
    return typeof number == 'number';
  }

  /**
   * Slice the given array to the given options.
   * @param array The array to slice.
   * @param options The options, can contain `limit` and `offset`.
   * @returns The (optionally) sliced array.
   */
  sliceWithOptions(array, options) {
    if(this.isValidNumber(options.offset) || this.isValidNumber(options.limit)) {
      var offset = this.isValidNumber(options.offset) ? options.offset : 0;
      var limit  = this.isValidNumber(options.limit)  ? offset + options.limit : array.length;
      array = array.slice(offset, limit);
    }
    return array;
  }

  /**
   * Converts the given xml node to an episode object.
   * @param episodeNode The xml node of the element.
   * @returns Episode object
   */
  episodeToObject(episodeNode, series) {
    return {
      series: series,
      episodeNumber: this.getXmlNodeText(episodeNode.get('EpisodeNumber')),
      seasonNumber: this.getXmlNodeText(episodeNode.get('SeasonNumber')),
      datePublished: this.getXmlNodeText(episodeNode.get('FirstAired')),
      description: this.getXmlNodeText(episodeNode.get('Overview')),
      name: this.getXmlNodeText(episodeNode.get('EpisodeName'))
    };
  }

  /**
   * Make a new triple.
   * @param s The subject.
   * @param p The predicate.
   * @param o The object.
   * @returns Triple object.
   */
  newTriple(s, p, o) {
    return { subject: s, predicate: p, object: o };
  }

  /**
   * Parse the uri of a tv uri.
   * @param uri The uri.
   * @returns {{}} Data containing seriesName, season and episode
   */
  parseTvUri(uri) {
    var data = {};
    if(uri && uri.indexOf(this.prefixes.lt) == 0) {
      var path = uri.substr(this.prefixes.lt.length, uri.length);
      var split = path.split("/");
      if(split.length >= 1) data.seriesName = split[0];
      if(split.length >= 2) data.season = parseInt(split[1]);
      if(split.length >= 3) data.episode = parseInt(split[2]);
    }
    return data;
  }
}

module.exports = new Util();