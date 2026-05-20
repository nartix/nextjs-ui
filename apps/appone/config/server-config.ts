import 'server-only';

const apiEnv = process.env.API_ENV ?? (process.env.PRODUCTION === 'true' ? 'production' : 'development');
const useDevelopmentApi = ['development', 'dev', 'local'].includes(apiEnv.toLowerCase());

export const API_BASE_URL = useDevelopmentApi ? process.env.API_URL_DEVELOPMENT : process.env.API_URL_PRODUCTION;
export const API_URL = `${API_BASE_URL}/${process.env.API_URL_PREFIX}/${process.env.API_URL_VERSION}`;
