import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

function upload(formData) {
    const url = `${BASE_URL}/upload`;
    return axios.post(url, formData)
        // get data
        .then(x => {
          x.data
          console.log(x)
        })
        // add url field
        .then(x => x.map(file => { 
          console.log(file)
          Object.assign({}, file, { url: `${BASE_URL}/files/${file.id}` })
        }
        ));
}

function fetchFiles() {
  return axios.get('http://localhost:8080/files')
}

export { upload, fetchFiles }