export const API_URL = process.env.PRODUCTION
  ? `${process.env.API_URL_PRODUCTION}/${process.env.API_URL_PREFIX}/${process.env.API_URL_VERSION}`
  : `${process.env.API_URL_DEVELOPMENT}/${process.env.API_URL_PREFIX}/${process.env.API_URL_VERSION}`;
