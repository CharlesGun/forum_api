class GetComment {
  constructor(payload) {
    this._verifyPayload(payload);
    
    const {id, username, date, content, replies} = this._mapCommentPayload(payload);

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
  }

  _mapCommentPayload(commentPayload) {
    return {
      ...commentPayload,
      content: commentPayload.isDeleted ? '**komentar telah dihapus**' : commentPayload.content,
    };
  }

  _verifyPayload({id, username, date, content, replies}) {
    if (!id || !username || !date || !content || !replies) {
      throw new Error('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string' || !(date instanceof Date) || typeof content !== 'string' || !Array.isArray(replies)) {
      throw new Error('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetComment;