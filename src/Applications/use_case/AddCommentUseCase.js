const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, threadId, useCasePayload) {
    const newComment = new NewComment(useCasePayload);

    await this._threadRepository.checkAvailabilityThread(threadId);
    const dbResponse = await this._commentRepository.addComment(ownerId, threadId, newComment);
    return new AddedComment({ ...dbResponse });
  }
}

module.exports = AddCommentUseCase;
