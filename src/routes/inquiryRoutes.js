import express from 'express';

export const createInquiryRouter = (models) => {
  const router = express.Router();

  // POST /api/inquiries - Submit contact message from storefront
  router.post('/', async (req, res) => {
    try {
      const { name, email, phone, message, subject } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
      }

      const inquiry = await models.Inquiry.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : 'General Store Inquiry',
        message: message.trim(),
        status: 'new'
      });

      // Also create an admin notification so the admin top-bar bell alerts immediately
      if (models.Notification) {
        try {
          await models.Notification.create({
            type: 'inquiry',
            platform: 'Storefront',
            message: `New inquiry from ${name.trim()}: "${subject ? subject.trim() : 'Store message'}"`,
            is_read: false,
            metadata: JSON.stringify({ email: email.trim(), phone: phone || null, inquiry_id: inquiry.id })
          });
        } catch (notifErr) {
          console.warn('Inquiry notification creation warning:', notifErr.message);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Your inquiry has been received. Our team will contact you shortly.',
        inquiry
      });
    } catch (err) {
      console.error('Error creating inquiry:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/inquiries - List all inquiries for admin
  router.get('/', async (req, res) => {
    try {
      const inquiries = await models.Inquiry.findAll({
        order: [['createdAt', 'DESC']]
      });
      return res.json({ success: true, inquiries });
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // PATCH /api/inquiries/:id/status - Update inquiry status
  router.patch('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const inquiry = await models.Inquiry.findByPk(id);
      if (!inquiry) {
        return res.status(404).json({ success: false, message: 'Inquiry not found.' });
      }
      inquiry.status = status || 'read';
      await inquiry.save();
      return res.json({ success: true, inquiry });
    } catch (err) {
      console.error('Error updating inquiry:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /api/inquiries/:id - Delete an inquiry
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const inquiry = await models.Inquiry.findByPk(id);
      if (!inquiry) {
        return res.status(404).json({ success: false, message: 'Inquiry not found.' });
      }
      await inquiry.destroy();
      return res.json({ success: true, message: 'Inquiry deleted successfully.' });
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};

