import Razorpay from 'razorpay';

export class PaymentService {
  constructor(keyId, keySecret) {
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_TwS8lhHECXyOSI';
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || 'HljKRvopPTRxznz0xbQcfdT5';
    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret
    });
  }

  async createRazorpayOrder(amountInRupees, receipt) {
    const amountInPaise = Math.round(parseFloat(amountInRupees) * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`
    };

    return this.razorpay.orders.create(options);
  }
}

export default PaymentService;

