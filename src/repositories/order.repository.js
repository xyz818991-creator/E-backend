export class OrderRepository {
  constructor(models) {
    this.Order = models.Order;
    this.OrderItem = models.OrderItem;
  }

  async findById(id) {
    return this.Order.findByPk(id, {
      include: [{ model: this.OrderItem, as: 'items' }]
    });
  }

  async findByOrderNumber(orderNumber) {
    return this.Order.findOne({
      where: { order_number: orderNumber },
      include: [{ model: this.OrderItem, as: 'items' }]
    });
  }

  async findByUserId(userId, options = {}) {
    return this.Order.findAll({
      where: { user_id: userId },
      include: [{ model: this.OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async findAll(options = {}) {
    return this.Order.findAll({
      include: [{ model: this.OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async create(orderData, itemsData = []) {
    const order = await this.Order.create(orderData);
    if (itemsData.length > 0) {
      const items = itemsData.map((it) => ({ ...it, order_id: order.id }));
      await this.OrderItem.bulkCreate(items);
    }
    return this.findById(order.id);
  }

  async updateStatus(id, orderStatus, paymentStatus = null) {
    const updates = { order_status: orderStatus };
    if (paymentStatus) updates.payment_status = paymentStatus;
    return this.Order.update(updates, { where: { id } });
  }
}

export default OrderRepository;

