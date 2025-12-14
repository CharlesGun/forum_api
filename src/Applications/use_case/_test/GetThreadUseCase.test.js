const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const GetReply = require('../../../Domains/replies/entities/GetReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrate the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';
    const mockDate = new Date("1999-11-21");
    const mockDate2 = new Date("1999-11-22");
    const mockDate3 = new Date("1999-11-23");

    const expectedThread = new GetThread({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: mockDate,
      username: 'user-123',
      comments: [
        new GetComment({
          id: 'comment-123',
          username: 'commenter1',
          date: mockDate2,
          content: 'This is a comment',
          replies: [
            new GetReply({
              id: 'reply-123',
              username: 'replier1',
              date: mockDate3,
              content: 'This is a reply',
            })
          ],
        }),
        new GetComment({
          id: 'comment-456',
          username: 'commenter2',
          date: mockDate2,
          content: '**komentar telah dihapus**',
          replies: [
            new GetReply({
              id: 'reply-123',
              username: 'replier1',
              date: mockDate3,
              content: 'This is a reply',
            })
          ],
        }),
      ],
    });

    // creating dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking needed function
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new GetThread({
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread Body',
        date: mockDate,
        username: 'user-123',
        comments: [],
      })));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new GetComment({
          id: 'comment-123',
          username: 'commenter1',
          date: mockDate2,
          content: 'This is a comment',
          replies: [],
        }),
        new GetComment({
          id: 'comment-456',
          username: 'commenter2',
          date: mockDate2,
          content: '**komentar telah dihapus**',
          replies: [],
        }),
      ]));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new GetReply({
          id: 'reply-123',
          username: 'replier1',
          date: mockDate3,
          content: 'This is a reply',
        }),
      ]));

    // creating use case instance
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);


    // Assert
    expect(getThread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload);
    expect(mockThreadRepository.getThread).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-456');
  });
});