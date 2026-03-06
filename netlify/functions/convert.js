const API_KEY = process.env.CLOUDCONVERT_API_KEY;
const BASE    = 'https://api.cloudconvert.com/v2';

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
    const ccHeaders = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

    if (action === 'create_job') {
      const res = await fetch(`${BASE}/jobs`, { method: 'POST', headers: ccHeaders, body: JSON.stringify(reqBody) });
      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    if (action === 'poll_job') {
      const res = await fetch(`${BASE}/jobs/${jobId}`, { headers: ccHeaders });
      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
