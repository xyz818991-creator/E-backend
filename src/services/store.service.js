export class StoreService {
  constructor(storeRepository) {
    this.storeRepo = storeRepository;
  }

  async getSettings() {
    return this.storeRepo.getAllSettings();
  }

  async updateSettings(settingsMap) {
    for (const [key, value] of Object.entries(settingsMap)) {
      await this.storeRepo.setSetting(key, value);
    }
    return this.storeRepo.getAllSettings();
  }
}

export default StoreService;

