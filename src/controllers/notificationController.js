export const recordSocialClick = (models) => async (req, res) => {
  try {
    const { platform } = req.body;
    if (!platform || typeof platform !== 'string') {
      return res.status(400).json({ success: false, message: 'Platform is required.' });
    }

    const norm = platform.trim().toLowerCase();
    let message = '';
    let platformName = '';
    let type = '';

    if (norm === 'whatsapp') {
      type = 'whatsapp';
      platformName = 'WhatsApp';
      message = 'A customer clicked the WhatsApp contact button.';
    } else if (norm === 'instagram') {
      type = 'instagram';
      platformName = 'Instagram';
      message = 'A customer clicked the Instagram profile link.';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform. Must be "whatsapp" or "instagram".'
      });
    }

    const metadataObj = {
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers['referer'] || '',
      timestamp: new Date().toISOString()
    };

    const notification = await models.Notification.create({
      type,
      platform: platformName,
      message,
      is_read: false,
      metadata: JSON.stringify(metadataObj)
    });

    return res.status(201).json({
      success: true,
      message: 'Click recorded successfully.',
      notification
    });
  } catch (error) {
    console.error('recordSocialClick error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record click event.',
      error: error.message
    });
  }
};

export const getAdminNotifications = (models) => async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const notifications = await models.Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit
    });

    const unread_count = await models.Notification.count({
      where: { is_read: false }
    });

    return res.json({
      success: true,
      notifications,
      unread_count
    });
  } catch (error) {
    console.error('getAdminNotifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
      error: error.message
    });
  }
};

export const markAsRead = (models) => async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await models.Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.is_read = true;
    await notification.save();

    const unread_count = await models.Notification.count({
      where: { is_read: false }
    });

    return res.json({
      success: true,
      message: 'Notification marked as read.',
      notification,
      unread_count
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
      error: error.message
    });
  }
};

export const markAllAsRead = (models) => async (req, res) => {
  try {
    await models.Notification.update(
      { is_read: true },
      { where: { is_read: false } }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
      unread_count: 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all as read.',
      error: error.message
    });
  }
};

export const deleteNotification = (models) => async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await models.Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await notification.destroy();

    const unread_count = await models.Notification.count({
      where: { is_read: false }
    });

    return res.json({
      success: true,
      message: 'Notification deleted.',
      unread_count
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification.',
      error: error.message
    });
  }
};

