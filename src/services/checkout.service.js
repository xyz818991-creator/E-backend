export class CheckoutService {
  constructor(orderRepository, productRepository) {
    this.orderRepo = orderRepository;
    this.productRepo = productRepository;
  }

  async processCheckout({ userId, items, shippingAddress, paymentMethod, couponCode, notes }) {
    if (!items || items.length === 0) {
      throw new Error('Checkout items cannot be empty.');
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.productRepo.findById(item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found.`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const price = parseFloat(product.selling_price);
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price,
        total
      });
    }

    const shippingCost = subtotal > 50000 ? 0 : 500;
    const totalAmount = subtotal + shippingCost;
    const orderNumber = `TEE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await this.orderRepo.create({
      order_number: orderNumber,
      user_id: userId || null,
      subtotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      payment_method: paymentMethod || 'cod',
      order_status: 'placed',
      payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
      coupon_code: couponCode || null,
      notes: notes || null
    }, orderItems);

    return order;
  }
}

export default CheckoutService;

