const config = require('../../config/index');
const FetchAPI = require('../services/fetch.service');
 
class BoardController {
  constructor(req, res) {
    this.req = req
    this.res = res
    this.miroToken = config.miro.accessToken
  }

  async fetchLink() {
    try {
      const sharingPolicy = { access: 'comment', teamAccess: 'edit'}
      const data = { name: 'Untitled', sharingPolicy }
      const result = await FetchAPI.postData('https://api.miro.com/v1/boards', this.miroToken, data) 
      return this.res.status(200).json({ success: true, link: result.viewLink })
    } catch (error) {
      console.log(error)
      return this.res.status(500).json({success: false, message: error.name, detail: error.message})
    }
  }
}

module.exports = BoardController;
