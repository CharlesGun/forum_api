const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NewReply = require('../../Domains/replies/entities/NewReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const GetReply = require('../../Domains/replies/entities/GetReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(owner, commentId, newReply) {
    const id = `reply-${this._idGenerator()}`;
    const {
      content
    } = newReply;
    const date = new Date();

    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, commentId, date, false ],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async checkAvailabilityReply(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyOwner(replyId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };
    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT r.id, r.content, r.date, r.is_deleted, u.username
             FROM replies r
             JOIN users u ON r.owner = u.id
             WHERE r.comment_id = $1
             ORDER BY r.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      return [];
    }

    return result.rows;
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;