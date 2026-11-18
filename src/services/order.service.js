export class OrderService {
  constructor(orderRepository) {
    this.orderRepo = orderRepository;
  }

  async getOrderById(id) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error('Order not found.');
    return order;
  }

  async getOrderByNumber(orderNumber) {
    const order = await this.orderRepo.findByOrderNumber(orderNumber);
    if (!order) throw new Error('Order not found.');
    return order;
  }

  async getUserOrders(userId) {
    return this.orderRepo.findByUserId(userId);
  }

  async getAllOrders() {
    return this.orderRepo.findAll();
  }

  async updateOrderStatus(id, status, paymentStatus = null) {
    return this.orderRepo.updateStatus(id, status, paymentStatus);
  }
}

export default OrderService;

