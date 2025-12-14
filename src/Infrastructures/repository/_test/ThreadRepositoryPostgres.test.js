const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepositoryPostgres', () => {

  afterAll(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      const newThread = new NewThread({
        title: 'this is title',
        body: 'this is body thread',
      });
      const dummyIdGenerator = () => '111';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, dummyIdGenerator);

      // Action
      const dbResponse = await threadRepositoryPostgres.addThread(owner, newThread);
      const addedThread = new AddedThread({ ...dbResponse });

      // Assert
      const threads = await ThreadTableTestHelper.findThreadById(addedThread.id);
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: addedThread.id,
        title: newThread.title,
        owner,
      }));
    });
  });

  describe('checkAvailabilityThread', () => {
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      const threadId = 'thread-999';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      const threadId = 'thread-111';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThread', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadId = 'thread-999';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThread(threadId))
        .rejects.toThrowError(NotFoundError);
    });
    
    it('should return get thread correctly', async () => {
      // Arrange
      const threadId = 'thread-222';
      const date = new Date('2024-01-01');
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'ekopatriotproklamasi'});
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: 'this is title',
        body: 'this is body thread',
        owner: 'user-222',
        date,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const dbResponse = await threadRepositoryPostgres.getThread(threadId);
      const getThread = new GetThread({ ...dbResponse, comments: [] });

      // Assert
      expect(getThread).toStrictEqual(new GetThread({
        id: threadId,
        title: 'this is title',
        body: 'this is body thread',
        date: date,
        username: 'ekopatriotproklamasi',
        comments: [],
      }));
    });
  });
});