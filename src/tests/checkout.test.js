import assert from 'assert';
import { validateOrder } from '../validators/order.validator.js';

console.log('Running checkout tests...');

const validOrder = validateOrder({
  items: [{ product_id: 1, quantity: 1 }],
  shipping_address: { full_name: 'Priya Sharma', address_line1: '123 Silk Lane', city: 'Chennai' }
});
assert.strictEqual(validOrder.error, null);

const invalidOrder = validateOrder({ items: [] });
assert.ok(invalidOrder.error);

console.log('✓ All Checkout unit tests passed.');

