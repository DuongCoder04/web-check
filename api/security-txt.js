import { URL } from 'url';
import middleware from './_common/middleware.js';
import { httpGet, isBotCheck, BOT_CHECK_ERROR, APP_UA } from './_common/http.js';

// RFC 9116 recommends .well-known first, legacy /security.txt as fallback
const SECURITY_TXT_PATHS = ['/.well-known/security.txt', '/security.txt'];

const parseResult = (result) => {
  let output = {};
  let counts = {};
  const lines = result.split('\n');
  const regex = /^([^:]+):\s*(.+)$/;

  for (const line of lines) {
    if (!line.startsWith('#') && !line.startsWith('-----') && line.trim() !== '') {
      const match = line.match(regex);
      if (match && match.length > 2) {
        let key = match[1].trim();
        const value = match[2].trim();
        if (output.hasOwnProperty(key)) {
          counts[key] = counts[key] ? counts[key] + 1 : 1;
          key += counts[key];
        }
        output[key] = value;
      }
    }
  }

  return output;
};

const isPgpSigned = (result) => {
  if (result.includes('-----BEGIN PGP SIGNED MESSAGE-----')) {
    return true;
  }
  return false;
};

const securityTxtHandler = async (urlParam) => {
  let url;
  try {
    url = new URL(urlParam.includes('://') ? urlParam : 'https://' + urlParam);
  } catch (error) {
    throw new Error('Invalid URL format');
  }
  url.pathname = '';

  for (let path of SECURITY_TXT_PATHS) {
    try {
      const res = await fetchSecurityTxt(url, path);
      if (isBotCheck(res)) return BOT_CHECK_ERROR;
      const result = res.status === 200 ? res.data : null;
      if (result && result.toLowerCase().includes('<html')) continue;
      if (result) {
        return {
          isPresent: true,
          foundIn: path,
          content: result,
          isPgpSigned: isPgpSigned(result),
          fields: parseResult(result),
        };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  return { isPresent: false };
};

// Fetch one candidate path, whatever status it returns
const fetchSecurityTxt = async (baseURL, path) => {
  const url = new URL(path, baseURL);
  return httpGet(url.toString(), { headers: { 'user-agent': APP_UA }, validateStatus: () => true });
};

export const handler = middleware(securityTxtHandler);
export default handler;
