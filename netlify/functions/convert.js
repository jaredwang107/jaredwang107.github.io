const https = require('https');
const API_KEY = process.env.CLOUDCONVERT_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMmY4MDJhODk4MGU4YzMyZDBiNjRjYmU1MDFjMDUyNWM0MDFlZDdlOWI5YjYwZjQ5MGM5ZWM1ZGRlMzU4NWUxMWJhZDFlMWQyZTMwNjNkYjAiLCJpYXQiOjE3NzMwMTcyNzUuMjM2NTU5LCJuYmYiOjE3NzMwMTcyNzUuMjM2NTYxLCJleHAiOjQ5Mjg2OTA4NzUuMjMxMDczLCJzdWIiOiI3NDU3MDAxMSIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.hdgT39othjisQwR-FiwVkYm-6i--LSxCTjCUnBoq1ff2ZXvppzhofP9tm2MCBS2RXHbStWDPpfmWnJXgU9PgPFuoD5IF0ijpHlS5AATYkqzJqqVkEzXTtXJG2pWZkE7-och71GA9PFiji7KujJIGlwdOhBygr6h_HbE3Y_ORTNVfZJZAMM265BJ3DWp4OsBdi9qUFzNjXU_aaYr-e9fZVAbgQwGtLM2ZpjlVM-3jmkxMWamaxWngBQP590gbZrExBGUDsrK4hnbkQGuCG-HHYINaq8ZyR7EqPndHBH4Mn-2BKfZGjH8gUW88a8dhfnz1duk00c9yYjUnSeIayANETxxXi7xrJ32BW89aqYVLGkdpLfYu9MTUBABhxrBiUBe7pDkbePo_7LdADxbe-k8koYEY05EUURuraE4MQ_myrZRPveXH6eZb4z2ePOsvIwF-vU2d0NxYZCSpQcqzYoQJG-UbxbDKpZpx9jwIOtoxKxESoVMmEAhpNJwujyUBz3i1Ig7LJ3BXKaAXWXArXEVLoUnpK0wEmBFIIoXRwVVx0yrnKdrJnENa89w4Uh8HYXv3enbq';
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
      if (res.status !== 201 && res.status !== 200) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: `CloudConvert ${res.status}: ${JSON.stringify(res.body)}` }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify(res.body) };
    }

    if (action === 'poll_job') {
      const res = await httpsRequest({
        hostname: BASE_HOST, path: `/v2/jobs/${jobId}`, method: 'GET',
        headers: authHeaders
      });
      return { statusCode: 200, headers, body: JSON.stringify(res.body) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
