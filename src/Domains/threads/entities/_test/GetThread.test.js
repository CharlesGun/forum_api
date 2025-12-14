const GetThread = require('../GetThread');

describe('GetThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      // missing id property
      title: 'Thread Title',
      body: 'Thread Body',
      date: new Date(),
      username: 'user123',
      comments: [],
    };

    // Action & Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123, // should be string
      title: 'Thread Title',
      body: 'Thread Body',
      date: '2023-10-10', // should be Date object
      username: 'user123',
      comments: 'not-an-array', // should be an array
    };

    // Action & Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetThread entity correctly when given valid payload', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: new Date('2023-10-10'),
      username: 'user123',
      comments: [],
    };
    
    // Action
    const getThread = new GetThread(payload);

    // Assert
    expect(getThread.id).toEqual(payload.id);
    expect(getThread.title).toEqual(payload.title);
    expect(getThread.body).toEqual(payload.body);
    expect(getThread.date).toEqual(payload.date);
    expect(getThread.username).toEqual(payload.username);
    expect(getThread.comments).toEqual(payload.comments);
  });

});