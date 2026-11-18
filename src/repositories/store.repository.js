export class StoreRepository {
  constructor(models) {
    this.StoreSetting = models.StoreSetting;
  }

  async getAllSettings() {
    const list = await this.StoreSetting.findAll();
    const map = {};
    list.forEach((item) => {
      map[item.key] = item.value;
    });
    return map;
  }

  async getSetting(key) {
    const item = await this.StoreSetting.findOne({ where: { key } });
    return item ? item.value : null;
  }

  async setSetting(key, value) {
    const [setting] = await this.StoreSetting.upsert({ key, value });
    return setting;
  }
}

export default StoreRepository;

