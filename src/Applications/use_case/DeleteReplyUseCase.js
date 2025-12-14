class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, threadId, commentId, replyId) {
    await this._threadRepository.checkAvailabilityThread(threadId)
    await this._commentRepository.checkAvailabilityComment(commentId)
    await this._replyRepository.checkAvailabilityReply(replyId);
    await this._replyRepository.verifyOwner(replyId, ownerId);
    return this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;