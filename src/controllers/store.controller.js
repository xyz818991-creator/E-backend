export const getStoreSettings = (models) => async (req, res) => {
  try {
    const list = await models.StoreSetting.findAll();
    const map = {};
    list.forEach((s) => { map[s.key] = s.value; });
    if (!map.store_name) map.store_name = 'Vwalah';
    if (!map.tagline) map.tagline = 'Tradition, Beautifully Curated.';
    if (!map.contact_email) map.contact_email = 'contact@vwalah.com';
    if (!map.contact_phone) map.contact_phone = '+91 98765 43210';
    if (!map.contact_hours) map.contact_hours = 'Mon–Sat, 10am–7pm IST';
    if (!map.about_story) map.about_story = 'Vwalah brings together temple-inspired designs, antique gold finishes and delicate pearl work, curated for weddings, festivals and every moment worth celebrating.';
    return res.json({ success: true, settings: map });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreSettings = (models) => async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      const existing = await models.StoreSetting.findOne({ where: { key } });
      if (existing) {
        existing.value = value;
        await existing.save();
      } else {
        await models.StoreSetting.create({ key, value });
      }
    }
    return res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

