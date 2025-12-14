const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
      const replyId = 'reply-123';
      const ownerId = 'user-123';
      const threadId = 'thread-123'
      const commentId = 'comment-123';

    // creating dependency of use case
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.checkAvailabilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.checkAvailabilityReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    });

    // Act
    await deleteReplyUseCase.execute(ownerId, threadId, commentId, replyId);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread)
      .toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toHaveBeenCalledWith(commentId);
    expect(mockReplyRepository.checkAvailabilityReply)
      .toHaveBeenCalledWith(replyId);
    expect(mockReplyRepository.verifyOwner)
      .toHaveBeenCalledWith(replyId, ownerId);
    expect(mockReplyRepository.deleteReply)
      .toHaveBeenCalledWith(replyId);
  });
});