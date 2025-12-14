const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ReplyTableTestHelper = require("../../../../tests/ReplyTableTestHelper");
const helper = require('./helper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('replies endpoint', () => {

  let userToken1 = null;
  let threadId = null;
  let commentId = null

  beforeEach(async () => {
    const server = await createServer(container);
    const user = {
      username: 'Budi',
      password: 'BudaBudiMu',
      fullname: 'Budi Setiawan',
    }

    const thread = {
      title: 'this is title',
      body: 'this is body thread',
    }

    const comment = {
      content: 'this is comment content',
    }

    userToken1 = (await helper.dummyUser(server, user)).accessToken;
    threadId = await helper.dummyThread(server, thread, userToken1);
    commentId = await helper.dummyComment(server, threadId, comment, userToken1);
  });

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    // thread not found
    it('should response 404 when thread is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const invalidThreadId = 'thread-999';
      const requestPayload = {
        content: 'Wah keren banget balasannya bang',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${invalidThreadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${userToken1}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    // comment not found
    it('should response 404 when comment is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const invalidCommentId = 'thread-999';
      const requestPayload = {
        content: 'Wah keren banget balasannya bang',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${invalidCommentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${userToken1}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    // success
    it('should response 201 when success', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        content: 'Wah keren banget balasannya bang',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${userToken1}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply).toEqual(expect.objectContaining({
        id: expect.any(String),
        content: requestPayload.content,
        owner: expect.any(String),
      }));
    })
  });

  describe('DELETE replies', () => {
    it('should response 200 when delete reply successfully', async () => {
      // Arrange
      const server = await createServer(container);
      const reply = {
        content: 'Wah keren banget balasannya bang',
      };
      const replyId = await helper.dummyReply(server, threadId, commentId, reply, userToken1);


      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${userToken1}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    })

    it('should response 404 when reply to delete is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const invalidReplyId = 'reply-999';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${invalidReplyId}`,
        headers: {
          Authorization: `Bearer ${userToken1}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should response 403 when user is not the owner of the reply', async () => {
      // Arrange
      const server = await createServer(container);
      const anotherUser = {
        username: 'Andi',
        password: 'AndiAndiMu',
        fullname: 'Andi Setiawan',
      }
      const anotherUserToken = (await helper.dummyUser(server, anotherUser)).accessToken;

      const reply = {
        content: 'Wah keren banget balasannya bang',
      };
      const replyId = await helper.dummyReply(server, threadId, commentId, reply, userToken1);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${anotherUserToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses resource ini');
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);
      const reply = {
        content: 'Wah keren banget balasannya bang',
      };
      const replyId = await helper.dummyReply(server, threadId, commentId, reply, userToken1);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});