const config = require('../../config/index');
const FetchAPI = require('../services/fetch.service');
 
class BoardController {
  constructor(req, res) {
    this.req = req
    this.res = res
    this.miroToken = config.miro.accessToken
    this.boardId = null
    this.boardLink = null
  };

  async fetchLink() {
    try {
      const sharingPolicy = { access: 'comment', teamAccess: 'edit'}
      const data = { name: 'Untitled', sharingPolicy }
      const result = await FetchAPI.postData('https://api.miro.com/v1/boards', this.miroToken, data) 
      this.boardId = result.id
      this.boardLink = result.viewLink
    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  };

  async shareBoard() {
    try {
      let emails = []
      emails.push(this.req.body.email)
      const teamInvitationStrategy = 'invite_when_required'
      const role = 'editor'
      const data = { emails, teamInvitationStrategy, role}
      const url = 'https://api.miro.com/v1/boards/'.concat(this.boardId,'/share')
      await FetchAPI.postData(url, this.miroToken, data)
      return this.res.status(200).json({ success: true, link: this.boardLink })
    } catch (error) {
      console.log(error)
      return this.res.status(500).json({success: false, message: error.name, detail: error.message})
    }
  };
};

module.exports = BoardController;
