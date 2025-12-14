const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const pool = require('../../database/postgres/pool');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123'
    });
    await ThreadTableTestHelper.addThread({
      id: 'thread-123'
    });
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const newComment = new NewComment({
        content: 'this is comment content',
      });
      const dummyIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, dummyIdGenerator);
      // Action
      const databaseResponse = await commentRepositoryPostgres.addComment(owner, threadId, newComment);
      const addedComment = new AddedComment({...databaseResponse});
      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(addedComment.id);

      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: newComment.content,
        owner,
      }));
    });
  });

  describe('checkAvailabilityComment', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentId = 'comment-999';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment(commentId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment is found', async () => {
      // Arrange
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment(commentId))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyOwner', () => {
    it('should throw AuthorizationError when owner not match', async () => {
      // Arrange
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({
        id: 'user-999',
        username: 'windahbarusadar',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyOwner(commentId, 'user-999'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner match', async () => {
      // Arrange
      const commentId = 'comment-123';
      const owner = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyOwner(commentId, owner))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments by thread id correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const threadId = 'thread-123';

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('comment-123');
      expect(comments[0].content).toBe('this is comment content');
      expect(comments[0].username).toBe('dicoding');
      expect(comments[0].is_deleted).toBe(false);
      expect(comments[0].date).toBeDefined();
      expect(comments[0].username).toBe('dicoding');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment from database', async () => {
      // Arrange
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments[0].is_deleted).toBe(true);
    });
  });
});