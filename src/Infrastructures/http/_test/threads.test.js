const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const helper = require('./helper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('/threads endpoint', () => {
  let threadId = null;

  afterAll(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'a new thread',
        body: 'thread body',
      };

      const user = {
        username: 'Budi',
        password: 'BudaBudiMu',
        fullname: 'Budi Setiawan',
      }

      const server = await createServer(container);

      const {accessToken} = await helper.dummyUser(server, user);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      threadId = responseJson.data.addedThread.id;
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should response 200 and thread detail', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});