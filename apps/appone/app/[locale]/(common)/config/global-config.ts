export const API_BASE_URL = process.env.PRODUCTION ? process.env.API_URL_PRODUCTION : process.env.API_URL_DEVELOPMENT;
export const API_URL = `${API_BASE_URL}/${process.env.API_URL_PREFIX}/${process.env.API_URL_VERSION}`;
