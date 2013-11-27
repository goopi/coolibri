/**
 * Module dependencies.
 */

var env = process.env;

/**
 * Expose Heroku helper.
 */

module.exports = {
  protocol: env.PROTOCOL,
  host: env.HOST,
  port: env.PORT,
  db: {
    name: env.DB_NAME,
    host: env.DB_HOST
  },
  salt: env.SALT,
  secret: env.SECRET,
  services: {
    twitter: {
      consumer_key: env.TWITTER_CONSUMER_KEY,
      consumer_secret: env.TWITTER_CONSUMER_SECRET,
      callback: env.TWITTER_CALLBACK
    }
  }
};
