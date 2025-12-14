const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const helper = require('./helper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('comments endpoint', () => {

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // thread not found
  describe('POST /threads/{threadId}/comments', () => {
    it('should response 404 when thread is not found', async () => {
      // Arrange

      const user = {
        username: 'Budi',
        password: 'BudaBudiMu',
        fullname: 'Budi Setiawan',
      }

      const requestPayload = {
        content: 'Buset, keren banget kamu bang',
      };

      const server = await createServer(container);

      const {accessToken} = (await helper.dummyUser(server, user));

      const invalidThreadId = 'thread-999';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${invalidThreadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  // successful post comment
  describe('POST /threads/{threadId}/comments', () => {
    it('should response 201 and peristed comment', async () => {
      // Arrange
      const user = {
        username: 'Budi',
        password: 'BudaBudiMu',
        fullname: 'Budi Setiawan',
      }

      const thread = {
        title: 'Thread tentang Budi yang terlalu GG',
        body: 'Budi GG dan Budi bangga',
      }

      const requestPayload = {
        content: 'Buset, keren banget kamu bang',
      };

      const server = await createServer(container);

      const {accessToken} = (await helper.dummyUser(server, user));
      const threadId = await helper.dummyThread(server, thread, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  // deleting but user is not the owner
  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 403 when user is not the owner of comment', async () => {
      // Arrange
      const user = {
        username: 'Budi',
        password: 'BudaBudiMu',
        fullname: 'Budi Setiawan',
      }

      const thread = {
        title: 'Thread tentang Budi yang terlalu GG',
        body: 'Budi GG dan Budi bangga',
      }

      const comment = {
        content: 'Buset, keren banget kamu bang',
      }
      const server = await createServer(container);

      const realAccessToken = (await helper.dummyUser(server, user)).accessToken;
      const threadId = await helper.dummyThread(server, thread, realAccessToken);
      const commentId = await helper.dummyComment(server, threadId, comment, realAccessToken);

      const anotherUser = {
        username: 'Andi',
        password: 'AndiAndiMu',
        fullname: 'Andi Setiawan',
      }

      const hackerAccessToken = (await helper.dummyUser(server, anotherUser)).accessToken;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${hackerAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses resource ini');
    });
  });
});