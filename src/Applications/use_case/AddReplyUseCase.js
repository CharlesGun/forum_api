const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, threadId, commentId, useCasePayload) {
    const newReply = new NewReply(useCasePayload);

    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    const dbResponse = await this._replyRepository.addReply(ownerId, commentId, newReply);
    return new AddedReply({ ...dbResponse });
  }
}

module.exports = AddReplyUseCase;