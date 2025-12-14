const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase')
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase')
const autoBind = require('auto-bind');

class ReplyHandler {
  constructor(container) {
    this._container = container

    autoBind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name)
    const owner = request.auth.credentials.id
    const { threadId, commentId } = request.params
    const newReply = {
      content: request.payload.content,
    }

    const addedReply = await addReplyUseCase.execute(
      owner,
      threadId,
      commentId,
      newReply
    )

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    })
    response.code(201)
    return response
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name)
    const { threadId, commentId, replyId } = request.params
    const owner = request.auth.credentials.id

    await deleteReplyUseCase.execute(owner, threadId, commentId, replyId)

    return {
      status: 'success',
    }
  }
}

module.exports = ReplyHandler