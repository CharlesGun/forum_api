const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddCommentUseCase = require("../AddCommentUseCase");

describe("AddCommentUseCase", () => {
  it("should orchestrating the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "This is a comment",
    };
    const threadId = "thread-123";
    const owner = "user-123";

    const mockAddedComment = new AddedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner: owner,
    });
    
    // creating dependency of use case
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(()=> Promise.resolve())
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    
    // creating use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(owner, threadId, useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner: owner,
    })
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(owner, threadId, new NewComment(useCasePayload));
  });
});