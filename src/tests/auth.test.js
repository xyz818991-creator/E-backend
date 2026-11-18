import assert from 'assert';
import { validateLogin, validateRegister } from '../validators/auth.validator.js';

console.log('Running auth tests...');

const validLogin = validateLogin({ email: 'test@example.com', password: 'password123' });
assert.strictEqual(validLogin.error, null, 'Valid login should pass validation');

const invalidLogin = validateLogin({ email: '', password: '' });
assert.ok(invalidLogin.error, 'Empty login should fail validation');

const validReg = validateRegister({ name: 'Test User', email: 'test@example.com', password: 'password123' });
assert.strictEqual(validReg.error, null, 'Valid register should pass');

console.log('✓ All Auth unit tests passed.');

