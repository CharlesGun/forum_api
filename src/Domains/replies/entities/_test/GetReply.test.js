const GetReply = require('../GetReply');

describe('GetReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      // missing id property
      content: 'This is a reply',
      username: 'user',
      // missing date property
      isDeleted: false,
    };

    // Action & Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'This is a reply',
      username: 'user',
      date: 1234567890, // should be string
      isDeleted: 'false', // should be boolean
    };

    // Action & Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should set content to "**balasan telah dihapus**" when isDeleted is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'This is a reply',
      username: 'user',
      date: new Date(),
      isDeleted: true,
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply.content).toEqual('**balasan telah dihapus**');
  });
  
  it('should create GetReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'This is a reply',
      username: 'user',
      date: new Date('2024-01-01'),
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.content).toEqual(payload.content);
    expect(getReply.username).toEqual(payload.username);
    expect(getReply.date).toEqual(payload.date);
  });
});