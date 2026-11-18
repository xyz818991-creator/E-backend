import assert from 'assert';
import { generateOrderNumber } from '../utils/helpers.js';

console.log('Running order tests...');

const orderNum = generateOrderNumber();
assert.ok(orderNum.startsWith('TEE-'), 'Order number should start with TEE-');

console.log('✓ All Orders unit tests passed.');

