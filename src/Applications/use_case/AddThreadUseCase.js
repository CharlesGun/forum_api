const AddedThread = require('../../Domains/threads/entities/AddedThread');
const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    const dbResponse = await this._threadRepository.addThread(ownerId, newThread);

    return new AddedThread({...dbResponse});
  }
}

module.exports = AddThreadUseCase;