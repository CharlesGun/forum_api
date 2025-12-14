const GetComment = require('../GetComment');

describe('GetComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      // missing id property
      content: 'This is a comment',
      username: 'user-123',
      isDeleted: false,
      // missing date property
      replies: []
    };
    
    // Action & Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123, // should be string
      content: 'This is a comment',
      username: 'user-123',
      isDeleted: false,
      date: '2024-01-01T00:00:00.000Z', // should be Date object
      replies: []
    };

    // Action & Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('the content of comment should be "**komentar telah dihapus**" when isDeleted is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: new Date(),
      content: 'This is a comment',
      isDeleted: true,
      replies: []
    };

    // Action
    const getComment = new GetComment(payload);

    // Assert
    expect(getComment.content).toEqual('**komentar telah dihapus**');
  });

  it('should create GetComment entity correctly when given valid payload', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'This is a comment',
      username: 'user-123',
      isDeleted: false,
      date: new Date('2020-01-01'),
      replies: []
    };

    // Action
    const getComment = new GetComment(payload);

    // Assert
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.content).toEqual(payload.content);
    expect(getComment.username).toEqual(payload.username);
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.replies).toEqual(payload.replies);
  });
});