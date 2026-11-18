import assert from 'assert';
import { validateProduct } from '../validators/product.validator.js';

console.log('Running product tests...');

const validProd = validateProduct({ name: 'Temple Necklace', selling_price: '48500' });
assert.strictEqual(validProd.error, null);

const invalidProd = validateProduct({ name: '', selling_price: '' });
assert.ok(invalidProd.error);

console.log('✓ All Product unit tests passed.');

