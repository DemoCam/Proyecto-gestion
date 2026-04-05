const fs = require('fs');
const https = require('https');

const screens = [
  { name: 'login', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2VhNDQ4ZWFiMTBhMjRhN2I5OTNmY2Y4YmI3YjcxNzg2EgsSBxDG2tD29QQYAZIBIwoKcHJvamVjdF9pZBIVQhM5MzgwODc4MDg0MjUzNDU4NTI3&filename=&opi=96797242' },
  { name: 'admin_users', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Q1Mjg3OWVmZDgzNTQ4MzliYzI1Y2ZmMmEyY2Q0NzJlEgsSBxDG2tD29QQYAZIBIwoKcHJvamVjdF9pZBIVQhM5MzgwODc4MDg0MjUzNDU4NTI3&filename=&opi=96797242' },
  { name: 'inventory', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzI4NTczOTZjNTliMTRmZDM4YjNiNzQ4ZTFhYzJlMzcwEgsSBxDG2tD29QQYAZIBIwoKcHJvamVjdF9pZBIVQhM5MzgwODc4MDg0MjUzNDU4NTI3&filename=&opi=89354086' },
];

screens.forEach(s => {
  https.get(s.url, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(s.name + '.html', data);
      console.log('Saved', s.name);
    });
  });
});
