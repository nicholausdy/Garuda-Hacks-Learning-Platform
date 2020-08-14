const fetch = require('node-fetch');

class FetchAPI {
  static async postData (url, token, data) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type':'application/json',
          'Authorization':'Bearer '.concat(token)
        },
        body: JSON.stringify(data)
      });
      return response.json()
    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  } 
}

module.exports = FetchAPI;