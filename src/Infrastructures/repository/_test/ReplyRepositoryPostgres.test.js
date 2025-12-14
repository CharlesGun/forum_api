const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const ReplyTableTestHelper = require("../../../../tests/ReplyTableTestHelper");

describe("ReplyRepositoryPostgres", () => {

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
    });
    await ThreadTableTestHelper.addThread({
      id: "thread-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
    });
  });

  afterAll(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addReply", () => {
    it("should persist new reply and return added reply correctly", async () => {
      // Arrange
      const owner = "user-123";
      const commentId = "comment-123";
      const newReply = new NewReply({
        content: "this is reply content",
      });
      const dummyIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        dummyIdGenerator
      );
      // Action
      const dbResponse = await replyRepositoryPostgres.addReply(
        owner,
        commentId,
        newReply
      );
      const addedReply = new AddedReply({ ...dbResponse });
      // Assert
      const replies = await ReplyTableTestHelper.findReplyById(addedReply.id);
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: newReply.content,
          owner,
        })
      );
    });
  });

  describe("checkAvailabilityReply", () => {
    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const replyId = "reply-999";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkAvailabilityReply(replyId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when reply is found", async () => {
      // Arrange
      const replyId = "reply-123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkAvailabilityReply(replyId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("getRepliesByCommentId", () => {
    it("should return replies by comment id correctly", async () => {
      // Arrange
      const commentId = "comment-123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        commentId
      );

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe("reply-123");
      expect(replies[0].content).toBe("this is reply content");
      expect(replies[0].date).toBeDefined();
      expect(replies[0].is_deleted).toBe(false);
      expect(replies[0].username).toBe("dicoding");
    });
  });

  describe('verifyOwner', () => {
    it('should throw AuthorizationError when owner is not the reply owner', async () => {
      // Arrange
      const replyId = 'reply-123';
      const owner = 'user-999';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyOwner(replyId, owner))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner is the reply owner', async () => {
      // Arrange
      const replyId = 'reply-123';
      const owner = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyOwner(replyId, owner))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply', () => {
    it('should delete reply from database', async () => {
      // Arrange
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);
      
      // Assert
      const replies = await ReplyTableTestHelper.findReplyById(replyId);
      expect(replies[0].is_deleted).toBe(true);
    });
  });
});