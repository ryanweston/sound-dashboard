import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function upload(formData) {
  const url = `${BASE_URL}/upload`;
  console.log('posty baby', formData)
  await axios.post(url, formData)
}

function fetchFiles() {
  return axios.get('http://localhost:3000/files')
}

export { upload, fetchFiles }