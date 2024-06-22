import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const url = 'http://localhost:3000/checkSentence'; // Replace with your API endpoint
  const payload = JSON.stringify({
    sentence: 'This is a load testing sentence',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token', // Add if your API is protected
    },
  };

  const res = http.post(url, payload, params);

  // Check if response status is 200 OK
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}
