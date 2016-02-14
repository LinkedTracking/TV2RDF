'use strict';

/**
 * An RdfProvider can give access to triples in a lazy manner.
 */
class RdfProvider {
  constructor(source) {
    this._source = source;
  }

  /**
   * Check if this provider can provide triples for the given patter?
   * @param subject The subject or null.
   * @param predicate The predicate or null.
   * @param object The object or null.
   * @return If triples might be found for this pattern.
   */
  hasTriples(subject, predicate, object) {
    throw new Error('hasTriples has not been implemented');
  }

  /**
   * Get triples from the given pattern.
   * @param subject The subject or null.
   * @param predicate The predicate or null.
   * @param object The object or null.
   * @param options The search options, can contain an optional limit and offset.
   * @param cb The callback
   */
  getTriples(subject, predicate, object, options, cb) {
    throw new Error('getTriples has not been implemented');
  }
}

module.exports = RdfProvider;