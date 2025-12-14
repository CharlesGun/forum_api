const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const AddReplyUseCase = require("../AddReplyUseCase");

describe("AddReplyUseCase", () => {
  it("should orchestrate the add reply action correctly", async () => {
    // Arrange
    const ownerId = "user-123";
    const commentId = "comment-123";
    const threadId = "thread-123";
    const useCasePayload = {
      content: "This is a reply",
    };

    const expectedAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: ownerId,
    });

    // creating dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking needed function
    mockThreadRepository.checkAvailabilityThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    // creating use case instance
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      ownerId,
      threadId,
      commentId,
      useCasePayload
    );

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: ownerId,
    }));
    expect(mockReplyRepository.addReply).toBeCalledWith(
      ownerId,
      commentId,
      new NewReply(useCasePayload)
    );
  });
});