// ========================
// الملف: storage-system.js
// ========================

class SmartStorageSystem {
    constructor() {
        this.STORAGE_KEYS = {
            FARMS: 'irrigation_saved_farms',
            CALCULATIONS: 'irrigation_calculations_history',
            USER_PROFILE: 'irrigation_user_profile',
            SETTINGS: 'irrigation_settings',

            // New Fertilizer Keys
            FERTILIZER_FARMS: 'fertilizer_saved_farms',
            FERTILIZER_CALCULATIONS: 'fertilizer_plans_history',
            FERTILIZER_WALLET: 'fertilizer_wallet_ledger'
        };

        this.currentFarmId = null;
        this.init();
    }

    init() {
        // تهيئة التخزين إذا كان فارغاً
        this.ensureStorageStructure();

        // تحديث الإحصائيات
        this.updateStats();
    }

    ensureStorageStructure() {
        const defaults = {
            [this.STORAGE_KEYS.FARMS]: {
                version: 2,
                lastUpdated: new Date().toISOString(),
                totalFarms: 0,
                farms: {}
            },
            [this.STORAGE_KEYS.CALCULATIONS]: {
                version: 1,
                calculations: []
            },
            [this.STORAGE_KEYS.USER_PROFILE]: {
                name: '',
                region: '',
                experience: 'beginner',
                joinDate: new Date().toISOString(),
                stats: {
                    totalCalculations: 0,
                    totalWaterSaved: 0,
                    favoriteCrops: []
                }
            },
            [this.STORAGE_KEYS.SETTINGS]: {
                language: 'ar',
                theme: 'light',
                units: 'metric',
                autoSave: true,
                backupFrequency: 'weekly'
            },
            // Fertilizer Defaults
            [this.STORAGE_KEYS.FERTILIZER_FARMS]: { version: 1, farms: {} },
            [this.STORAGE_KEYS.FERTILIZER_CALCULATIONS]: { version: 1, plans: [] },
            [this.STORAGE_KEYS.FERTILIZER_WALLET]: {
                version: 1,
                total_npk: { n: 0, p: 0, k: 0 },
                total_cost: 0,
                transactions: 0
            }
        };

        Object.keys(defaults).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(defaults[key]));
            } else {
                // التحقق من التحديثات
                this.migrateStorage(key, JSON.parse(localStorage.getItem(key)));
            }
        });
    }

    migrateStorage(key, existingData) {
        // تحديث بنية التخزين إذا لزم الأمر
        const defaults = {
            [this.STORAGE_KEYS.FARMS]: { version: 2 },
            [this.STORAGE_KEYS.CALCULATIONS]: { version: 1 },
            [this.STORAGE_KEYS.USER_PROFILE]: { version: 1 },
            [this.STORAGE_KEYS.SETTINGS]: { version: 1 },
            [this.STORAGE_KEYS.FERTILIZER_FARMS]: { version: 1 },
            [this.STORAGE_KEYS.FERTILIZER_CALCULATIONS]: { version: 1 },
            [this.STORAGE_KEYS.FERTILIZER_WALLET]: { version: 1 }
        };

        // Safety check: ensure we have defaults for this key
        if (!defaults[key]) return;

        // Safety check: handle malformed existing data
        const currentVersion = (existingData && existingData.version) ? existingData.version : 0;
        const targetVersion = defaults[key].version;

        if (currentVersion < targetVersion) {
            console.log(`تحديث تخزين ${key} من v${currentVersion} إلى v${targetVersion}`);
            // هنا يمكن إضافة منطق التحديث
            // في حالة البيانات الفاسدة جداً، يمكن إعادة تعيينها كخيار أخير:
            // if (currentVersion === 0) { ... }
        }
    }

    // ========================
    // إدارة المزارع
    // ========================

    saveFarm(farmData, farmName = null) {
        try {
            const farmsData = this.getAllFarms();
            const farmId = farmData.id || `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const farmToSave = {
                id: farmId,
                name: farmName || `مزرعة ${Object.keys(farmsData.farms).length + 1}`,
                ...farmData,
                metadata: {
                    created: farmData.metadata?.created || new Date().toISOString(),
                    updated: new Date().toISOString(),
                    version: '2.0',
                    savedBy: this.getUserProfile().name || 'مستخدم'
                }
            };

            // إضافة أو تحديث
            farmsData.farms[farmId] = farmToSave;
            farmsData.totalFarms = Object.keys(farmsData.farms).length;
            farmsData.lastUpdated = new Date().toISOString();

            // حفظ
            localStorage.setItem(this.STORAGE_KEYS.FARMS, JSON.stringify(farmsData));

            // تحديث الإحصائيات
            this.updateStats();

            // تسجيل في التاريخ
            this.addToHistory('farm_saved', { farmId, farmName: farmToSave.name });

            this.currentFarmId = farmId;

            return {
                success: true,
                farmId,
                message: `تم حفظ "${farmToSave.name}" بنجاح`
            };

        } catch (error) {
            console.error('خطأ في حفظ المزرعة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    updateFarm(farmId, updates) {
        const farmsData = this.getAllFarms();

        if (!farmsData.farms[farmId]) {
            return { success: false, error: 'المزرعة غير موجودة' };
        }

        farmsData.farms[farmId] = {
            ...farmsData.farms[farmId],
            ...updates,
            metadata: {
                ...farmsData.farms[farmId].metadata,
                updated: new Date().toISOString()
            }
        };

        localStorage.setItem(this.STORAGE_KEYS.FARMS, JSON.stringify(farmsData));

        return {
            success: true,
            message: 'تم تحديث المزرعة بنجاح'
        };
    }

    deleteFarm(farmId) {
        const farmsData = this.getAllFarms();

        if (!farmsData.farms[farmId]) {
            return { success: false, error: 'المزرعة غير موجودة' };
        }

        const farmName = farmsData.farms[farmId].name;
        delete farmsData.farms[farmId];
        farmsData.totalFarms = Object.keys(farmsData.farms).length;
        farmsData.lastUpdated = new Date().toISOString();

        localStorage.setItem(this.STORAGE_KEYS.FARMS, JSON.stringify(farmsData));

        // تسجيل في التاريخ
        this.addToHistory('farm_deleted', { farmId, farmName });

        // إذا كانت المزرعة المحذوفة هي الحالية، قم بمسحها
        if (this.currentFarmId === farmId) {
            this.currentFarmId = null;
        }

        return {
            success: true,
            message: `تم حذف "${farmName}" بنجاح`
        };
    }

    getAllFarms() {
        const data = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FARMS) || '{}');
        if (!data.farms) data.farms = {};
        return data;
    }

    getFarm(farmId) {
        const farmsData = this.getAllFarms();
        return farmsData.farms[farmId] || null;
    }

    getFarmsList(sortBy = 'updated', filter = {}) {
        const farmsData = this.getAllFarms();
        let farms = Object.values(farmsData.farms || {});

        // التصفية
        if (filter.crop) {
            farms = farms.filter(farm => farm.crop === filter.crop);
        }

        if (filter.region) {
            farms = farms.filter(farm => farm.region === filter.region);
        }

        // الترتيب
        switch (sortBy) {
            case 'name':
                farms.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                break;
            case 'created':
                farms.sort((a, b) => new Date(b.metadata.created) - new Date(a.metadata.created));
                break;
            case 'updated':
                farms.sort((a, b) => new Date(b.metadata.updated) - new Date(a.metadata.updated));
                break;
            case 'size':
                farms.sort((a, b) => (b.area || 0) - (a.area || 0));
                break;
        }

        return farms;
    }

    // ========================
    // إدارة الحسابات
    // ========================

    saveCalculation(calculationData, farmId = null) {
        try {
            const calcId = `calc_${Date.now()}`;

            const calculation = {
                id: calcId,
                farmId,
                timestamp: new Date().toISOString(),
                ...calculationData
            };

            // Get raw object to modify
            const historyObj = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CALCULATIONS) || '{"calculations": []}');
            if (!historyObj.calculations) historyObj.calculations = [];

            historyObj.calculations.unshift(calculation);

            // Limit to 100
            if (historyObj.calculations.length > 100) {
                historyObj.calculations = historyObj.calculations.slice(0, 100);
            }

            localStorage.setItem(this.STORAGE_KEYS.CALCULATIONS, JSON.stringify(historyObj));

            // تحديث إحصائيات المستخدم
            this.updateUserStats(calculationData);

            return {
                success: true,
                calculationId: calcId
            };

        } catch (error) {
            console.error('خطأ في حفظ الحساب:', error);
            return { success: false, error: error.message };
        }
    }

    getCalculationsHistory(limit = 20, farmId = null) {
        // Return Array for external use
        const historyObj = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CALCULATIONS) || '{"calculations": []}');
        let calculations = historyObj.calculations || [];

        if (farmId) {
            calculations = calculations.filter(calc => calc.farmId === farmId);
        }

        if (limit) {
            calculations = calculations.slice(0, limit);
        }

        return calculations;
    }

    // ========================
    // ملف المستخدم
    // ========================

    getUserProfile() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_PROFILE) || '{}');
    }

    updateUserProfile(updates) {
        const profile = this.getUserProfile();
        const updatedProfile = {
            ...profile,
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));

        return updatedProfile;
    }

    // Helper to safely extract water value regardless of structure
    extractWaterValue(data) {
        let val = 0;

        // 1. Direct property (legacy/simple)
        if (data.waterRequired) val = data.waterRequired;

        // 2. Inside results object (Basic Mode often puts it here as dailyWater)
        else if (data.results && data.results.dailyWater) val = data.results.dailyWater;

        // 3. Inside results.waterRequirements (Advanced Mode/New Arch)
        else if (data.results && data.results.waterRequirements && data.results.waterRequirements.dailyGross) {
            val = data.results.waterRequirements.dailyGross;
        } else if (data.waterRequirements && data.waterRequirements.dailyGross) {
            val = data.waterRequirements.dailyGross;
        }

        return parseFloat(val) || 0;
    }

    updateUserStats(calculationData) {
        const profile = this.getUserProfile();

        if (!profile.stats) {
            profile.stats = {
                totalCalculations: 0,
                totalWaterCalculated: 0,
                averageEfficiency: 0,
                favoriteCrops: []
            };
        }

        // تحديث الإحصائيات
        profile.stats.totalCalculations++;

        // Fix: Use the robust extractor
        const waterVal = this.extractWaterValue(calculationData);
        if (waterVal > 0) {
            // Defensive: Ensure counter exists and is a number
            if (typeof profile.stats.totalWaterCalculated !== 'number') {
                profile.stats.totalWaterCalculated = 0;
            }
            profile.stats.totalWaterCalculated += waterVal;
        }

        if (calculationData.efficiency || (calculationData.results && calculationData.results.distributionUniformity)) {
            const oldAvg = profile.stats.averageEfficiency;
            let newEff = 0;
            if (calculationData.efficiency) newEff = parseFloat(calculationData.efficiency);
            else if (calculationData.results && calculationData.results.distributionUniformity) newEff = parseFloat(calculationData.results.distributionUniformity) * 100; // usually 0-1

            if (newEff > 0) {
                profile.stats.averageEfficiency =
                    (oldAvg * (profile.stats.totalCalculations - 1) + newEff) /
                    profile.stats.totalCalculations;
            }
        }

        // تحديث المحاصيل المفضلة
        const cropName = calculationData.crop || (calculationData.data && calculationData.data.crop);
        if (cropName && !profile.stats.favoriteCrops.includes(cropName)) {
            profile.stats.favoriteCrops.push(cropName);
        }

        this.updateUserProfile({ stats: profile.stats });
    }

    // ========================
    // الإعدادات
    // ========================

    getSettings() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SETTINGS) || '{}');
    }

    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...newSettings,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));

        return updatedSettings;
    }

    // ========================
    // وظائف مساعدة
    // ========================

    addToHistory(action, data) {
        try {
            let historyObj = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CALCULATIONS) || '{"calculations": []}');

            // Defensive coding: handle case where it might be null or array
            if (!historyObj || Array.isArray(historyObj)) {
                historyObj = { calculations: [] };
            }

            if (!historyObj.calculations || !Array.isArray(historyObj.calculations)) {
                historyObj.calculations = [];
            }

            const historyEntry = {
                action,
                data,
                timestamp: new Date().toISOString()
            };

            // إضافة إلى بداية المصفوفة
            historyObj.calculations.unshift({
                id: `hist_${Date.now()}`,
                type: 'history',
                ...historyEntry
            });

            localStorage.setItem(this.STORAGE_KEYS.CALCULATIONS, JSON.stringify(historyObj));
        } catch (e) {
            console.error('Error adding to history:', e);
            // Non-critical failures shouldn't block main flow, but we log them.
        }
    }

    // Recalculate stats from actual saved farms to ensure consistency
    recalculateStatsFromFarms() {
        const farmsData = this.getAllFarms();
        const farms = Object.values(farmsData.farms || {});

        let totalWater = 0;
        let totalCalculations = farms.length;

        farms.forEach(farm => {
            totalWater += this.extractWaterValue(farm);
        });

        const profile = this.getUserProfile();
        if (!profile.stats) profile.stats = {};

        // Update stats
        profile.stats.totalFarms = totalCalculations;
        profile.stats.totalWaterCalculated = totalWater;
        profile.stats.totalCalculations = totalCalculations; // Or keep cumulative if preferred, but usually synced with saved farms is better for "Stats" view

        this.updateUserProfile({ stats: profile.stats });

        return {
            totalFarms: totalCalculations,
            totalWaterCalculated: totalWater
        };
    }

    updateStats() {
        const farmsData = this.getAllFarms();
        const calculationsHistory = this.getCalculationsHistory(1000);

        // Recalculate water based on actual farms
        const farmStats = this.recalculateStatsFromFarms();

        // Calculate storage usage
        const storageUsage = {
            farmsBytes: JSON.stringify(farmsData).length,
            historyBytes: JSON.stringify(calculationsHistory).length,
            totalBytes: 0,
            kilobytes: 0
        };

        storageUsage.totalBytes = storageUsage.farmsBytes + storageUsage.historyBytes;
        storageUsage.kilobytes = (storageUsage.totalBytes / 1024).toFixed(2);

        return {
            totalFarms: farmStats.totalFarms,
            totalCalculations: farmStats.totalFarms, // Synced to avoid confusion (User wants consistency)
            storageUsage
        };
    }

    getStorageUsage() {
        let totalBytes = 0;

        Object.keys(this.STORAGE_KEYS).forEach(key => {
            const value = localStorage.getItem(this.STORAGE_KEYS[key]);
            if (value) {
                totalBytes += new Blob([value]).size;
            }
        });

        return {
            bytes: totalBytes,
            kilobytes: (totalBytes / 1024).toFixed(2),
            megabytes: (totalBytes / (1024 * 1024)).toFixed(2)
        };
    }

    exportAllData(format = 'json') {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '2.0',
                system: 'حاسبة الري الذكية'
            },
            farms: this.getAllFarms(),
            calculations: this.getCalculationsHistory(1000),
            userProfile: this.getUserProfile(),
            settings: this.getSettings(),
            stats: this.updateStats()
        };

        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(exportData);
        }

        return exportData;
    }

    convertToCSV(data) {
        // تحويل المزارع إلى CSV
        const farms = data.farms.farms ? Object.values(data.farms.farms) : [];
        let csv = 'المزارع المحفوظة\n';
        csv += 'الاسم,المحصول,المساحة,المنطقة,تاريخ الإنشاء\n';

        farms.forEach(farm => {
            csv += `"${farm.name}","${farm.crop || ''}","${farm.area || 0}","${farm.region || ''}","${farm.metadata?.created || ''}"\n`;
        });

        csv += '\n\nالحسابات السابقة\n';
        csv += 'التاريخ,المحصول,كمية المياه,الكفاءة\n';

        data.calculations.forEach(calc => {
            if (calc.type !== 'history') {
                csv += `"${calc.timestamp}","${calc.crop || ''}","${calc.waterRequired || 0}","${calc.efficiency || 0}"\n`;
            }
        });

        return csv;
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.metadata?.system !== 'حاسبة الري الذكية') {
                throw new Error('ملف غير صالح');
            }

            // استيراد المزارع
            if (data.farms) {
                localStorage.setItem(this.STORAGE_KEYS.FARMS, JSON.stringify(data.farms));
            }

            // استيراد الحسابات
            if (data.calculations) {
                localStorage.setItem(this.STORAGE_KEYS.CALCULATIONS, JSON.stringify(data.calculations));
            }

            // استيراد ملف المستخدم
            if (data.userProfile) {
                localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.userProfile));
            }

            // استيراد الإعدادات
            if (data.settings) {
                localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            }

            this.updateStats();

            return {
                success: true,
                message: 'تم استيراد البيانات بنجاح',
                stats: this.updateStats()
            };

        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });

        this.init(); // إعادة التهيئة بالقيم الافتراضية

        return {
            success: true,
            message: 'تم مسح جميع البيانات'
        };
    }

    backupToFile() {
        const data = this.exportAllData('json');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `irrigation_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        this.addToHistory('backup_created', { date: new Date().toISOString() });

        return {
            success: true,
            message: 'تم إنشاء نسخة احتياطية'
        };
    }

    // التحقق من النسخ الاحتياطية التلقائية
    checkAutoBackup() {
        const settings = this.getSettings();

        if (!settings.autoSave) return;

        const lastBackup = localStorage.getItem('last_auto_backup');
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (!lastBackup || (now - parseInt(lastBackup)) > oneWeek) {
            this.backupToFile();
            localStorage.setItem('last_auto_backup', now.toString());
        }
    }

    // ========================
    // نظام الأسمدة (Fertilizer System)
    // ========================

    // 1. حفظ خطة تسميد
    saveFertilizerPlan(planData, farmId = null) {
        try {
            const planId = `fertpln_${Date.now()}`;
            const plan = {
                id: planId,
                farmId, // Optional: Link to a saved farm
                timestamp: new Date().toISOString(),
                ...planData
            };

            // Get history
            const historyObj = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FERTILIZER_CALCULATIONS) || '{"plans": []}');
            if (!historyObj.plans) historyObj.plans = [];

            historyObj.plans.unshift(plan);

            // Limit to 50
            if (historyObj.plans.length > 50) {
                historyObj.plans = historyObj.plans.slice(0, 50);
            }

            localStorage.setItem(this.STORAGE_KEYS.FERTILIZER_CALCULATIONS, JSON.stringify(historyObj));

            // Update Wallet (Accumulate Usage)
            this.updateFertilizerWallet(planData);

            return { success: true, planId };
        } catch (error) {
            console.error('خطأ في حفظ خطة التسميد:', error);
            return { success: false, error: error.message };
        }
    }

    // 2. تحديث محفظة الأسمدة (تراكمي)
    updateFertilizerWallet(planData) {
        let wallet = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FERTILIZER_WALLET) || '{"total_npk": {"n":0, "p":0, "k":0}, "total_cost": 0, "transactions": 0}');

        // Accumulate NPK
        if (planData.totals) {
            wallet.total_npk.n += (parseFloat(planData.totals.n) || 0);
            wallet.total_npk.p += (parseFloat(planData.totals.p) || 0);
            wallet.total_npk.k += (parseFloat(planData.totals.k) || 0);
        }

        // Accumulate Cost (If available)
        if (planData.estimatedCost) {
            wallet.total_cost += (parseFloat(planData.estimatedCost) || 0);
        }

        wallet.transactions++;
        wallet.last_transaction = new Date().toISOString();

        localStorage.setItem(this.STORAGE_KEYS.FERTILIZER_WALLET, JSON.stringify(wallet));
    }

    // 3. استرجاع المحفظة
    getFertilizerWallet() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FERTILIZER_WALLET) || '{"total_npk": {"n":0, "p":0, "k":0}, "total_cost": 0, "transactions": 0}');
    }

    // 4. استرجاع سجل الخطط
    getFertilizerHistory() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FERTILIZER_CALCULATIONS) || '{"plans": []}').plans;
    }

    // 5. حذف خطة تسميد
    deleteFertilizerPlan(planId) {
        try {
            const historyObj = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FERTILIZER_CALCULATIONS) || '{"plans": []}');
            if (!historyObj.plans) return { success: false, error: 'No plans found' };

            const initialLength = historyObj.plans.length;
            historyObj.plans = historyObj.plans.filter(p => p.id !== planId);

            if (historyObj.plans.length === initialLength) {
                return { success: false, error: 'Plan not found' };
            }

            localStorage.setItem(this.STORAGE_KEYS.FERTILIZER_CALCULATIONS, JSON.stringify(historyObj));
            return { success: true };
        } catch (error) {
            console.error('Error deleting plan:', error);
            return { success: false, error: error.message };
        }
    }
}

// Explicitly expose to window to ensure global access
window.SmartStorageSystem = SmartStorageSystem;
console.log('✅ Storage System Module Loaded');

