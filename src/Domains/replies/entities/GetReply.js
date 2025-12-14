class GetReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, date, username} = this._mapReplyPayload(payload);

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload({ id, content, date, username }) {
    if (!id || !content || !date || !username) {
      throw new Error('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || !(date instanceof Date) || typeof username !== 'string') {
      throw new Error('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
  
  _mapReplyPayload(replyPayload) {
    return {
      ...replyPayload,
      content: replyPayload.isDeleted ? '**balasan telah dihapus**' : replyPayload.content,
    };
  }
}

module.exports = GetReply;