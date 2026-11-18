export class AuthRepository {
  constructor(models) {
    this.User = models.User;
  }

  async findByEmail(email) {
    return this.User.findOne({ where: { email } });
  }

  async createUser(userData) {
    return this.User.create(userData);
  }

  async updateLastLogin(userId) {
    return this.User.update({ last_login_at: new Date() }, { where: { id: userId } });
  }
}

export default AuthRepository;

