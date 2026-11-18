export class UserRepository {
  constructor(models) {
    this.User = models.User;
  }

  async findById(id) {
    return this.User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async findAll(options = {}) {
    return this.User.findAll({
      attributes: { exclude: ['password'] },
      ...options
    });
  }

  async update(id, updates) {
    return this.User.update(updates, { where: { id } });
  }

  async delete(id) {
    return this.User.destroy({ where: { id } });
  }
}

export default UserRepository;

