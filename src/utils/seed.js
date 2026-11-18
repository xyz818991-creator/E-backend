import bcrypt from 'bcryptjs';

export const ensureStoreSettings = async (models) => {
  try {
    const defaultStoreSettings = [
      { key: 'store_name', value: 'Vwalah' },
      { key: 'tagline', value: 'Tradition, Beautifully Curated.' },
      { key: 'contact_email', value: 'contact@vwalah.com' },
      { key: 'contact_phone', value: '+91 98765 43210' },
      { key: 'contact_hours', value: 'Mon–Sat, 10am–7pm IST' },
      { key: 'about_story', value: 'Vwalah brings together temple-inspired designs, antique gold finishes and delicate pearl work, curated for weddings, festivals and every moment worth celebrating.' }
    ];

    for (const s of defaultStoreSettings) {
      const existing = await models.StoreSetting.findOne({ where: { key: s.key } });
      if (!existing) {
        await models.StoreSetting.create(s);
      } else if (s.key === 'store_name' && (!existing.value || existing.value === 'The Ethnic Edit')) {
        existing.value = 'Vwalah';
        await existing.save();
      } else if (s.key === 'about_story' && existing.value && existing.value.includes('The Ethnic Edit')) {
        existing.value = existing.value.replace(/The Ethnic Edit/g, 'Vwalah');
        await existing.save();
      }
    }

    // Ensure banners kick is updated to Vwalah if currently 'The Ethnic Edit'
    await models.Banner.update(
      { kick: 'Vwalah' },
      { where: { kick: 'The Ethnic Edit' } }
    );
  } catch (err) {
    console.warn('[DB] ensureStoreSettings note:', err.message);
  }
};

export const ensureDefaultLogins = async (models) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);

    // 1. Primary admin account (admin@theethnicedit.com)
    const [adminUser, createdAdmin] = await models.User.findOrCreate({
      where: { email: 'admin@theethnicedit.com' },
      defaults: {
        name: 'Store Administrator',
        email: 'admin@theethnicedit.com',
        password: adminPassword,
        role: 'admin',
        phone: null,
        is_active: true
      }
    });

    if (!createdAdmin) {
      let needsSave = false;
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        needsSave = true;
      }
      if (!adminUser.is_active) {
        adminUser.is_active = true;
        needsSave = true;
      }
      if (needsSave) {
        await adminUser.save();
      }
    }
    console.log('✓ [DB Auth] Default admin verified: admin@theethnicedit.com (role: admin, password: admin123)');

    // 2. Brand admin account (admin@vwalah.com)
    const [brandAdmin, createdBrand] = await models.User.findOrCreate({
      where: { email: 'admin@vwalah.com' },
      defaults: {
        name: 'Vwalah Administrator',
        email: 'admin@vwalah.com',
        password: adminPassword,
        role: 'admin',
        phone: '+91 98765 43210',
        is_active: true
      }
    });

    if (!createdBrand) {
      if (brandAdmin.role !== 'admin' || !brandAdmin.is_active) {
        brandAdmin.role = 'admin';
        brandAdmin.is_active = true;
        await brandAdmin.save();
      }
    }
    console.log('✓ [DB Auth] Brand admin verified: admin@vwalah.com (role: admin, password: admin123)');

    // 3. Demo customer account (customer@theethnicedit.com)
    const [customerUser, createdCustomer] = await models.User.findOrCreate({
      where: { email: 'customer@theethnicedit.com' },
      defaults: {
        name: 'Verified Customer',
        email: 'customer@theethnicedit.com',
        password: customerPassword,
        role: 'customer',
        phone: '+91 91234 56789',
        address: 'No. 42, Heritage Enclave, T. Nagar, Chennai, Tamil Nadu - 600017',
        is_active: true
      }
    });

    if (!createdCustomer && !customerUser.is_active) {
      customerUser.is_active = true;
      await customerUser.save();
    }
    console.log('✓ [DB Auth] Default customer verified: customer@theethnicedit.com (role: customer, password: customer123)');
  } catch (err) {
    console.warn('⚠️ [DB Auth] ensureDefaultLogins error:', err.message);
  }
};

export const seedDatabase = async (models) => {
  try {
    // 1. Ensure brand store settings in database
    await ensureStoreSettings(models);

    // 2. Ensure default logins exist and are active in database on every server startup
    await ensureDefaultLogins(models);

    // 3. Ensure Banners exist in database
    const bannersCount = await models.Banner.count();
    if (bannersCount === 0) {
      await models.Banner.create({
        title: 'Tradition, Beautifully Curated.',
        subtitle: 'Timeless imitation jewellery for every celebration, crafted in 24k antique gold.',
        kick: 'Vwalah',
        button_text: 'Explore Collection',
        button_link: '/shop',
        desktop_image: '/uploads/jewels.png',
        mobile_image: '/uploads/jewels.png',
        type: 'hero',
        display_order: 1,
        is_active: true
      });

      await models.Banner.create({
        title: 'Bridal Grandeur Showcase.',
        subtitle: 'Temple Lakshmi Chokers, Vaddanams, and Kemp Jhumkas for the bride.',
        kick: 'South Indian Heritage',
        button_text: 'Explore Bridal',
        button_link: '/category/bridal-jewellery',
        desktop_image: '/uploads/Royal Gold Jewellery Collection.png',
        mobile_image: '/uploads/Royal Gold Jewellery Collection.png',
        type: 'hero',
        display_order: 2,
        is_active: true
      });
      console.log('✓ [DB] Initial hero banners seeded.');
    }

    // 4. Ensure Promotional Coupons exist in database
    await models.Coupon.findOrCreate({
      where: { code: 'WELCOME10' },
      defaults: {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        min_order_value: 5000,
        max_discount: 5000,
        usage_limit: 500,
        is_active: true
      }
    });

    await models.Coupon.findOrCreate({
      where: { code: 'ETHNIC20' },
      defaults: {
        code: 'ETHNIC20',
        type: 'percentage',
        value: 20,
        min_order_value: 15000,
        max_discount: 10000,
        usage_limit: 200,
        is_active: true
      }
    });

    // 5. Ensure all 14 Imitation Jewellery Categories exist
    const categoriesData = [
      { name: 'Earrings', slug: 'earrings', description: 'Antique kemp jhumkas, chandbalis, and pearl drop studs.', image_url: '/uploads/earring.png', display_order: 1 },
      { name: 'Necklaces', slug: 'necklaces', description: 'Heirloom temple chokers, mango malas and royal bridal necklaces.', image_url: '/uploads/necklaces.png', display_order: 2 },
      { name: 'Necklace Sets', slug: 'necklace-sets', description: 'Coordinated necklace and earring bridal sets.', image_url: '/uploads/jewels.png', display_order: 3 },
      { name: 'Bangles', slug: 'bangles', description: 'Traditional kada bangles, valayal sets, and antique floral cuffs.', image_url: '/uploads/bangles.png', display_order: 4 },
      { name: 'Bracelets', slug: 'bracelets', description: 'Dainty gold plated charm bracelets and cuff bangles.', image_url: '/uploads/bangles.png', display_order: 5 },
      { name: 'Rings', slug: 'rings', description: 'Exquisite statement cocktail rings and Navratna gemstone bands.', image_url: '/uploads/rings.png', display_order: 6 },
      { name: 'Anklets', slug: 'anklets', description: 'Antique payal and delicate bell ghungroo anklets.', image_url: '/uploads/Elegant_Gold_Payal_Collection_1793954681101-923423412.png', display_order: 7 },
      { name: 'Mangalsutra', slug: 'mangalsutra', description: 'Traditional black bead gold plated mangalsutras and modern pendant chains.', image_url: '/uploads/necklaces.png', display_order: 8 },
      { name: 'Waist Belts', slug: 'waist-belts', description: 'Handcrafted temple ottiyanam and bridal vaddanam waist belts.', image_url: '/uploads/waist belt.png', display_order: 9 },
      { name: 'Bridal Jewellery', slug: 'bridal-jewellery', description: 'Complete grand bridal trousseau collections for wedding muhurthams.', image_url: '/uploads/Royal Gold Jewellery Collection.png', display_order: 10 },
      { name: 'Temple Jewellery', slug: 'temple-jewellery', description: 'Traditional nakshi carved South Indian deity motifs.', image_url: '/uploads/necklaces.png', display_order: 10 }
    ];

    const createdCategories = {};
    for (const cat of categoriesData) {
      const [c] = await models.Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat
      });
      createdCategories[cat.slug] = c.id;
    }

    // 6. Check Products Count - only populate default catalogue if database has 0 products
    const productCount = await models.Product.count();
    if (productCount > 0) {
      console.log(`ℹ️ [DB] Database has ${productCount} live products. Preserving administrator catalogue changes.`);
      return;
    }

    console.log('🌱 [DB] Seeding database with initial products catalogue...');

    // 3. Seed Imitation Jewellery Products across categories
    const productsData = [
      {
        name: 'Temple Lakshmi Royal Choker & Necklace',
        slug: 'temple-lakshmi-necklace',
        short_description: 'Intricately handcrafted Goddess Lakshmi motif with antique kemp stones.',
        description: 'This temple necklace is an ode to timeless South Indian bridal grandeur. Featuring an ornate central pendant of Goddess Lakshmi flanked by dancing peacocks, accented with deep red kemp stones and natural freshwater pearls. Plated in 24k antique matte gold finish.',
        original_price: 54900,
        selling_price: 48500,
        sku: 'TEE-NCK-001',
        stock: 12,
        material: '24k Antique Matte Gold Plating',
        colour: 'Ruby Red & Gold',
        occasion: 'Bridal & Muhurtham',
        collection_type: 'Temple Heritage',
        weight: '128g',
        dimensions: 'Length: 22cm, Width: 6.5cm',
        rating: 4.9,
        reviews_count: 142,
        is_featured: true,
        category_id: createdCategories['necklaces'],
        images: ['/uploads/necklaces.png']
      },
      {
        name: 'South Indian Antique Pearl Jhumka Earrings',
        slug: 'pearl-jhumka-earrings',
        short_description: 'Tiered temple jhumkis with delicate seed pearl clusters.',
        description: 'Classic bell-shaped jhumkas suspended from an intricate floral ear stud. Finished with a fringe of micro seed pearls that sway gently with every step. Perfect for festive celebrations and wedding receptions.',
        original_price: 21500,
        selling_price: 18900,
        sku: 'TEE-EAR-002',
        stock: 18,
        material: 'Hypoallergenic Brass with Dual Gold Wash',
        colour: 'Antique Gold & Pearl White',
        occasion: 'Festive & Sangeet',
        collection_type: 'Best Seller',
        weight: '42g',
        dimensions: 'Drop Length: 6.5cm, Width: 3.2cm',
        rating: 4.8,
        reviews_count: 98,
        is_featured: true,
        category_id: createdCategories['earrings'],
        images: ['/uploads/earring.png']
      },
      {
        name: 'Royal Heritage Antique Gold Filigree Bangles',
        slug: 'antique-gold-bangles',
        short_description: 'Pair of handcrafted filigree kadas with floral motifs.',
        description: 'Pair of solid kada bangles showcasing openwork filigree craft inspired by temple architecture. Screw-fastened for a comfortable, secure fit on wrist sizes 2.4 to 2.8.',
        original_price: 36000,
        selling_price: 32400,
        sku: 'TEE-BNG-003',
        stock: 8,
        material: 'Cast Artisan Brass with 24k Gold Layering',
        colour: 'Antique Gold',
        occasion: 'Bridal & Festive',
        collection_type: 'Trending',
        weight: '96g',
        dimensions: 'Width: 2.8cm, Fits wrist size 2.4-2.8',
        rating: 4.9,
        reviews_count: 76,
        is_featured: true,
        category_id: createdCategories['bangles'],
        images: ['/uploads/bangles.png']
      },
      {
        name: 'Kemp Gemstone Floral Cocktail Ring',
        slug: 'gemstone-cocktail-ring',
        short_description: 'Statement ruby and polki flower ring on vintage gold band.',
        description: 'Centred with an oval cabochon synthetic ruby surrounded by floral petals encrusted with un-cut polki crystals. The adjustable band ensures effortless styling across fingers.',
        original_price: 14500,
        selling_price: 12600,
        sku: 'TEE-RNG-004',
        stock: 25,
        material: 'Copper-Brass Alloy with Micro Gold Finish',
        colour: 'Ruby Red & Polki White',
        occasion: 'Party & Cocktail',
        collection_type: 'Top-Rated',
        weight: '18g',
        dimensions: 'Ring Crown Diameter: 3.4cm',
        rating: 4.7,
        reviews_count: 54,
        is_featured: true,
        category_id: createdCategories['rings'],
        images: ['/uploads/Ornate Ruby Floral Ring on Purple Velvet.png']
      },
      {
        name: 'Temple Goddess Lakshmi Bridal Vaddanam Waist Belt',
        slug: 'temple-waist-belt',
        short_description: 'Bridal ottiyanam featuring Nakshi carvings and pearl latkans.',
        description: 'An heirloom vaddanam waist belt crafted for the contemporary bride. The central panel depicts Goddess Lakshmi surrounded by miniature carved deities, ending in flowing pearl drop tassels with an adjustable link chain.',
        original_price: 62000,
        selling_price: 54900,
        sku: 'TEE-BLT-005',
        stock: 6,
        material: 'Solid Core Brass with 24k Matte Gold Plate',
        colour: 'Antique Matte Gold',
        occasion: 'Bridal Muhurtham',
        collection_type: 'Bridal Jewellery',
        weight: '210g',
        dimensions: 'Span: 85cm with 20cm extender',
        rating: 5.0,
        reviews_count: 45,
        is_featured: true,
        category_id: createdCategories['waist-belts'],
        images: ['/uploads/waist belt.png']
      },


      {
        name: 'Traditional Kemp Ghungroo Payal Anklets',
        slug: 'kemp-ghungroo-payal-anklets',
        short_description: 'Pair of melodic temple bell anklets with kemp floral clusters.',
        description: 'Exquisite antique gold anklets handcrafted with soothing musical ghungroo bells and ruby kemp stones.',
        original_price: 15500,
        selling_price: 13200,
        sku: 'TEE-ANK-008',
        stock: 14,
        material: 'Jeweller Brass Alloy with Anti-Tarnish Finish',
        colour: 'Antique Gold',
        occasion: 'Festive & Classical Dance',
        collection_type: 'Trending',
        weight: '65g',
        dimensions: 'Length: 26cm (Pair)',
        rating: 4.8,
        reviews_count: 42,
        is_featured: true,
        category_id: createdCategories['anklets'],
        images: ['/uploads/Elegant_Gold_Payal_Collection_1793954681101-923423412.png']
      },
      {
        name: 'Auspicious Lakshmi Gold Plated Mangalsutra',
        slug: 'lakshmi-gold-mangalsutra',
        short_description: 'Traditional double line black bead chain with auspicious Lakshmi thali pendant.',
        description: 'Hand-knotted black beads on gold wire featuring a sacred Goddess Lakshmi motif pendant flanked by basra pearls.',
        original_price: 18000,
        selling_price: 15400,
        sku: 'TEE-MNG-009',
        stock: 20,
        material: '24k Micron Gold Plated Silver & Brass',
        colour: 'Black & Gold',
        occasion: 'Daily & Auspicious',
        collection_type: 'Daily Wear',
        weight: '24g',
        dimensions: 'Chain Length: 30 inches',
        rating: 4.9,
        reviews_count: 91,
        is_featured: true,
        category_id: createdCategories['mangalsutra'],
        images: ['/uploads/necklaces.png']
      },

      {
        name: 'Navratna Royal Openable Kada Bracelet',
        slug: 'navratna-kada-bracelet',
        short_description: 'Nine planetary gemstones embedded in an openable hinge cuff bracelet.',
        description: 'Traditional Navratna kada bracelet featuring authentic planetary gemstone hues set on an intricately engraved floral gold cuff.',
        original_price: 24000,
        selling_price: 20500,
        sku: 'TEE-BRC-012',
        stock: 11,
        material: 'Artisan Brass with Antique Gold Patina',
        colour: 'Multi-Colour Gemstones & Gold',
        occasion: 'Festive & Auspicious',
        collection_type: 'Trending',
        weight: '48g',
        dimensions: 'Openable Free-Size',
        rating: 4.9,
        reviews_count: 53,
        is_featured: true,
        category_id: createdCategories['bracelets'],
        images: ['/uploads/bracelet1_1793958602281-758908322.png']
      },
      {
        name: 'Sacred Temple Nakshi Kemp Heritage Necklace',
        slug: 'temple-nakshi-kemp-heritage-necklace',
        short_description: 'Pure 24k gold wash antique temple necklace depicting Goddess Lakshmi with peacock carvings.',
        description: 'Handcrafted by master temple artisans in Madurai. Features intricate nakshi carvings of Goddess Lakshmi flanked by twin peacocks, studded with natural kemp stones and pearl latkans.',
        original_price: 52000,
        selling_price: 46800,
        sku: 'TEE-TMP-013',
        stock: 14,
        material: '24k Antique Matte Gold Plating',
        colour: 'Antique Gold & Ruby Kemp',
        occasion: 'Temple Muhurtham & Bridal',
        collection_type: 'Temple Heritage',
        weight: '115g',
        dimensions: 'Length: 20cm, Width: 5.5cm',
        rating: 4.9,
        reviews_count: 87,
        is_featured: true,
        category_id: createdCategories['temple-jewellery'],
        images: ['/uploads/necklaces.png']
      },

    ];

    for (const pData of productsData) {
      const { images, ...pFields } = pData;
      const [product, created] = await models.Product.findOrCreate({
        where: { slug: pFields.slug },
        defaults: pFields
      });

      if (created && images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await models.ProductImage.create({
            product_id: product.id,
            image_url: images[i],
            is_primary: i === 0,
            display_order: i
          });
        }
      }
    }

    console.log('✓ [DB] Initial products seeded successfully.');
  } catch (error) {
    console.error('❌ [DB] Seeding error:', error);
  }
};
