const GetComment = require("../../Domains/comments/entities/GetComment");
const GetReply = require("../../Domains/replies/entities/GetReply");

class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {

    await this._threadRepository.checkAvailabilityThread(threadId);
    const thread = await this._threadRepository.getThread(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // for (const comment of comments) {
    //   comment.content = comment.is_deleted ? '**komentar telah dihapus**' : comment.content;
    //   const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
    //   comment.replies = replies;
    // }

    thread.comments = await Promise.all(comments.map(async (comment) => {
      const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
      replies.map((reply) => new GetReply({
        id: reply.id,
        content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
        date: reply.date,
        username: reply.username,
      }));

      return new GetComment({
        id: comment.id,
        content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
        date: comment.date,
        username: comment.username,
        replies: replies,
      })
    }));


    return thread;
  }
}

module.exports = GetThreadUseCase;