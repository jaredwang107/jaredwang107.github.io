const https = require('https');
const API_KEY = process.env.CLOUDCONVERT_API_KEY;
const BASE_HOST = 'api.cloudconvert.com';

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const { action, jobId, body: reqBody } = JSON.parse(event.body);
    const authHeaders = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    };

    if (action === 'create_job') {
      const bodyStr = JSON.stringify(reqBody);
      const res = await httpsRequest({
        hostname: BASE_HOST, path: '/v2/jobs', method: 'POST',
        headers: { ...authHeaders, 'Content-Length': Buffer.byteLength(bodyStr) }
      }, bodyStr);
      return { statusCode: res.status, headers, body: JSON.stringify(res.body) };
    }

    if (action === 'poll_job') {
      const res = await httpsRequest({
        hostname: BASE_HOST, path: `/v2/jobs/${jobId}`, method: 'GET',
        headers: authHeaders
      });
      return { statusCode: res.status, headers, body: JSON.stringify(res.body) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
