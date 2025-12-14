const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const autoBind = require('auto-bind');

class CommentHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const owner = request.auth.credentials.id;
    const { threadId } = request.params;
    const newComment = {
      content: request.payload.content,
    };

    const addedComment = await addCommentUseCase.execute(owner, threadId, newComment);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { threadId, commentId } = request.params;
    const owner = request.auth.credentials.id;

    await deleteCommentUseCase.execute(owner, threadId, commentId);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentHandler;