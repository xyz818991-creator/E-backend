import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

export class AuthService {
  constructor(authRepository) {
    this.authRepo = authRepository;
  }

  async login(email, password) {
    const user = await this.authRepo.findByEmail(email);
    if (!user) throw new Error('Invalid email or password.');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid email or password.');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await this.authRepo.updateLastLogin(user.id);

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      token
    };
  }

  async register({ name, email, password, phone }) {
    const existing = await this.authRepo.findByEmail(email);
    if (existing) throw new Error('An account with this email already exists.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.authRepo.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer'
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      token
    };
  }
}

export default AuthService;

