export class UserService {
  constructor(userRepository) {
    this.userRepo = userRepository;
  }

  async getProfile(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found.');
    return user;
  }

  async updateProfile(userId, updateData) {
    const { name, phone, addresses, notification_preferences } = updateData;
    const fields = {};
    if (name) fields.name = name;
    if (phone) fields.phone = phone;
    if (addresses) fields.addresses = addresses;
    if (notification_preferences) fields.notification_preferences = notification_preferences;

    await this.userRepo.update(userId, fields);
    return this.userRepo.findById(userId);
  }

  async getAllUsers(options) {
    return this.userRepo.findAll(options);
  }
}

export default UserService;

