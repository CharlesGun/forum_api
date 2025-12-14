module.exports = {
  dummyUser: async (server, payload) => {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload,
    });

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payload.username,
        password: payload.password,
      },
    });

    const accessToken = JSON.parse(loginResponse.payload).data.accessToken;
    const userId = JSON.parse(response.payload).data.addedUser.id
    return {
      accessToken,
      userId
    };
  },

  dummyThread: async (server, payload, accessToken) => {
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const threadId = JSON.parse(response.payload).data.addedThread.id;
    return threadId;
  },

  dummyComment: async (server, threadId, payload, accessToken) => {
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const commentId = JSON.parse(response.payload).data.addedComment.id;
    return commentId;
  },

  dummyReply: async (server, threadId, commentId, payload, accessToken) => {
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const replyId = JSON.parse(response.payload).data.addedReply.id;
    
    return replyId;
  },
};