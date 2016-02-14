'use strict';

class Util {
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
   * Helper function to check if something is a valid number.
   * @param number The value to check.
   * @returns {boolean} If it is a number.
   * @private
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
    if(this.isValidNumber(options.offset)) {
      array = array.slice(options.offset, this.isValidNumber(options.limit) ? options.offset + options.limit : episodes.length);
    }
    return array;
  }

  /**
   * Converts the given xml node to an episode object.
   * @param episodeNode The xml node of the element.
   * @returns Episode object
   */
  episodeToObject(episodeNode) {
    return {
      episodeNumber: episodeNode.get('EpisodeNumber').text(),
      datePublished: episodeNode.get('FirstAired').text(),
      description: episodeNode.get('Overview').text(),
      name: episodeNode.get('EpisodeName').text()
    };
  }
}

module.exports = new Util();