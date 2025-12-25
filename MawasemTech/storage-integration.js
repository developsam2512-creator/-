// =============================
// الملف: storage-integration.js
// =============================

class StorageIntegration {
    constructor() {
        this.storage = new SmartStorageSystem();
        this.currentData = null;
        this.currentResults = null;

        this.initUI();
        this.loadUserPreferences();
    }

    initUI() {
        // إضافة أزرار الحفظ والتحميل للواجهة سيتم عبر main-integration.js أو هنا
        // لكن بما أننا نستخدم main-integration للتهيئة، سنركز هنا على الوظائف

        // إضافة CSS
        this.addStorageStyles();

        // إضافة مستمعات الأحداث
        this.setupEventListeners();
    }

    addStorageStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .save-btn { background: #4CAF50 !important; color: white !important; }
            .load-btn { background: #2196F3 !important; color: white !important; }
            .manage-btn { background: #FF9800 !important; color: white !important; }
            
            .farms-manager-container {
                padding: 20px;
                background: #f9f9f9;
                border-radius: 10px;
                margin: 20px 0;
                max-width: 1000px;
                margin: 50px auto;
                position: relative;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            }
            
            .farms-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #ddd;
                padding-bottom: 15px;
            }
            
            .farms-toolbar {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .search-box {
                flex: 1;
                position: relative;
                min-width: 250px;
            }
            
            .search-box input {
                width: 100%;
                padding: 10px 15px 10px 40px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 1rem;
            }
            
            .search-box i {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: #888;
            }
            
            .filter-options {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .filter-options select {
                padding: 10px 15px;
                border: 2px solid #ddd;
                border-radius: 8px;
                min-width: 150px;
            }
            
            .farms-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .stat-card {
                background: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .stat-icon {
                min-width: 50px;
                height: 50px;
                background: #4CAF50;
                color: white;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: #333;
            }
            
            .stat-label {
                color: #666;
                font-size: 0.9rem;
            }
            
            .farms-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                max-height: 500px;
                overflow-y: auto;
                padding: 5px;
            }
            
            .farm-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                transition: transform 0.3s;
                border-right: 5px solid #4CAF50; /* RTL support */
            }
            
            .farm-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .farm-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            
            .farm-name {
                font-size: 1.2rem;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            
            .farm-crop {
                color: #4CAF50;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .farm-actions {
                display: flex;
                gap: 8px;
            }
            
            .farm-action-btn {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                border: none;
                background: #f5f5f5;
                color: #666;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .farm-action-btn:hover {
                background: #4CAF50;
                color: white;
            }
            
            .farm-details {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            
            .farm-detail-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 0.9rem;
            }
            
            .farm-detail-label {
                color: #666;
            }
            
            .farm-detail-value {
                color: #333;
                font-weight: 500;
            }
            
            .farm-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 10px;
            }
            
            .farm-tag {
                background: #e3f2fd;
                color: #1976d2;
                padding: 3px 10px;
                border-radius: 15px;
                font-size: 0.8rem;
            }
            
            .empty-state {
                text-align: center;
                padding: 50px 20px;
                color: #666;
            }
            
            .empty-icon {
                font-size: 4rem;
                color: #ddd;
                margin-bottom: 20px;
            }
            
            /* Modal Styles */
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
                border-radius: 15px 15px 0 0;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                background: #f8f9fa;
                border-radius: 0 0 15px 15px;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                transition: color 0.3s;
            }
            
            .close-modal:hover { color: #f44336; }
            
            .load-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .load-option {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
                border: 2px solid transparent;
            }
            
            .load-option:hover {
                background: #e3f2fd;
                border-color: #2196F3;
                transform: translateY(-3px);
            }
            
            .load-option .option-icon {
                font-size: 2rem;
                color: #4CAF50;
                margin-bottom: 10px;
            }
            
            .recent-calculations {
                max-height: 300px;
                overflow-y: auto;
            }
            
            .recent-calculation {
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 8px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: background 0.3s;
                background: white;
            }
            
            .recent-calculation:hover {
                background: #f0f7ff;
                border-color: #2196F3;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary { background: #4CAF50; color: white; }
            .btn-primary:hover { background: #388E3C; transform: translateY(-2px); }
            
            .btn-secondary { background: #757575; color: white; }
            .btn-secondary:hover { background: #616161; }
            
            .btn-danger { background: #f44336; color: white; }
            .btn-danger:hover { background: #d32f2f; }
            
            .form-group { margin-bottom: 20px; }
            
            .form-input {
                width: 100%;
                padding: 10px 15px;
                border: 2px solid #ddd;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }
            
            .form-input:focus {
                border-color: #4CAF50;
                outline: none;
                box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
            }
            
            .form-help {
                color: #666;
                font-size: 0.85rem;
                margin-top: 5px;
                display: block;
            }
            
            .current-data-preview {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
                border: 1px dashed #ddd;
            }
            
            /* Manager Overlay */
            #farmsManager {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(5px);
                z-index: 9999;
                overflow-y: auto;
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // حفظ تلقائي عند الحساب
        document.addEventListener('calculationComplete', (event) => {
            this.currentData = event.detail.inputData;
            this.currentResults = event.detail.results;

            const settings = this.storage.getSettings();
            if (settings.autoSave && this.storage.currentFarmId) {
                this.autoSaveCalculation();
            }
        });

        // حفظ تلقائي عند التغيير
        let saveTimeout;
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (this.storage.getSettings().autoSave) {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        this.autoSaveChanges();
                    }, 2000);
                }
            });
        });

        // تحديث واجهة إدارة المزارع عند الفتح
        document.addEventListener('farmsManagerOpened', () => {
            this.refreshFarmsManager();
        });
    }

    // ========================
    // واجهة حفظ المزرعة
    // ========================

    showSaveOptions() {
        if (!this.currentData) {
            // محاولة جلب البيانات الحالية إذا لم تكن موجودة
            if (window.irrigationSystem && window.irrigationSystem.ui) {
                // Check active mode
                const isAdvanced = document.getElementById('advancedMode').style.display === 'block';
                if (isAdvanced) {
                    this.currentData = window.irrigationSystem.ui.collectAdvancedData();
                } else {
                    this.currentData = window.irrigationSystem.ui.collectBasicData();
                }
                // Warning: results might make be missing if not passed explicitly, assume user wants to save config
            }

            if (!this.currentData || !this.currentData.crop) {
                alert('الرجاء إدخال البيانات أو إجراء حساب أولاً.');
                return;
            }
        }

        const modal = document.getElementById('saveFarmModal') || this.createSaveModal();
        document.getElementById('dataPreview').innerHTML = this.generateDataPreview();

        // Check Update Mode
        const nameInput = document.getElementById('farmName');
        const descInput = document.getElementById('farmDescription');
        const tagsInput = document.getElementById('farmTags');
        const modalTitle = modal.querySelector('h3');
        const saveBtn = modal.querySelector('.btn-primary');

        if (this.storage.currentFarmId) {
            const farm = this.storage.getFarm(this.storage.currentFarmId);
            if (farm) {
                if (nameInput) nameInput.value = farm.name;
                if (descInput) descInput.value = farm.description || '';
                if (tagsInput) tagsInput.value = (farm.tags || []).join(', ');

                if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-edit"></i> تحديث المزرعة`;
                if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-save"></i> حفظ التعديلات`;
            }
        } else {
            // Reset for new save
            if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-save"></i> حفظ المزرعة`;
            if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-save"></i> حفظ المزرعة`;
            if (nameInput) nameInput.value = '';
            if (descInput) descInput.value = '';
            if (tagsInput) tagsInput.value = '';
        }

        modal.style.display = 'flex';
        setTimeout(() => document.getElementById('farmName').focus(), 100);
    }

    createSaveModal() {
        const modalHTML = `
            <div id="saveFarmModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-save"></i> حفظ المزرعة</h3>
                        <button class="close-modal" onclick="storageIntegration.closeSaveFarmModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="farmName">اسم المزرعة *</label>
                            <input type="text" id="farmName" placeholder="مثال: مزرعة الطماطم الصيفية" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label for="farmDescription">وصف المزرعة (اختياري)</label>
                            <textarea id="farmDescription" rows="3" placeholder="أضف وصفاً مختصراً للمزرعة..." class="form-input"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="farmTags">وسوم (اختياري)</label>
                            <input type="text" id="farmTags" placeholder="طماطم, صيفي, تنقيط" class="form-input">
                            <small class="form-help">افصل الوسوم بفواصل</small>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="autoSaveCalculations" checked style="width: auto;">
                                حفظ الحسابات التلقائية لهذه المزرعة
                            </label>
                        </div>
                        
                        <div class="current-data-preview">
                            <h4>بيانات الحفظ:</h4>
                            <div id="dataPreview"></div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="storageIntegration.closeSaveFarmModal()">إلغاء</button>
                        <button class="btn btn-primary" onclick="storageIntegration.saveCurrentFarm()">
                            <i class="fas fa-save"></i> حفظ المزرعة
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById('saveFarmModal');
    }

    generateDataPreview() {
        if (!this.currentData) return '<p>لا توجد بيانات</p>';

        // Helper to get crop name securely
        let cropName = this.currentData.crop;
        if (typeof agricultureDatabase !== 'undefined' && agricultureDatabase.crops[cropName]) {
            cropName = agricultureDatabase.crops[cropName].name;
        }

        // Logic to extract water value carefully (Unified Logic)
        let waterVal = 0;
        if (this.currentResults) {
            if (this.currentResults.dailyWater) {
                waterVal = parseFloat(this.currentResults.dailyWater);
            } else if (this.currentResults.waterRequirements && this.currentResults.waterRequirements.dailyGross) {
                waterVal = parseFloat(this.currentResults.waterRequirements.dailyGross);
            } else if (this.currentResults.waterRequired) {
                waterVal = parseFloat(this.currentResults.waterRequired);
            }
        }

        return `
            <div style="font-size: 0.9rem;">
                <div><strong>المحصول:</strong> ${cropName || 'غير محدد'}</div>
                <div><strong>المساحة:</strong> ${this.currentData.area || 0} ${this.currentData.areaUnit || 'هكتار'}</div>
                <div><strong>المنطقة:</strong> ${this.currentData.region || 'غير محدد'}</div>
                <div><strong>نظام الري:</strong> ${this.currentData.system || this.currentData.systemType || 'غير محدد'}</div>
                ${waterVal > 0 ? `<div><strong>الاحتياج المائي:</strong> ${waterVal.toFixed(2)} م³/يوم</div>` : '<div><strong>الاحتياج المائي:</strong> 0 م³/يوم</div>'}
            </div>
        `;
    }

    closeSaveFarmModal() {
        const modal = document.getElementById('saveFarmModal');
        if (modal) modal.style.display = 'none';

        const nameInput = document.getElementById('farmName');
        if (nameInput) nameInput.value = '';

        const descInput = document.getElementById('farmDescription');
        if (descInput) descInput.value = '';
    }

    // ========================
    // نظام التنبيهات (تم التحديث)
    // ========================

    showNotification(message, type = 'success') {
        // إنشاء العنصر إذا لم يكن موجوداً
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10001;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container); // تأكد من إضافته للـ body
        }

        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-weight: bold;
            min-width: 300px;
            text-align: center;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        `;

        const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
        notification.innerHTML = `${icon} <span>${message}</span>`;

        container.appendChild(notification);

        // تفعيل الأنيميشن
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // إخفاء تلقائي
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveCurrentFarm() {
        try {
            const farmName = document.getElementById('farmName').value.trim();
            if (!farmName) {
                this.showNotification('الرجاء إدخال اسم للمزرعة', 'error');
                document.getElementById('farmName').focus();
                return;
            }

            // تحقق إضافي من البيانات
            if (!this.currentData) {
                console.warn('Current data is missing, attempting recovery...');
                this.currentData = this.collectFormData();
            }

            const farmData = {
                ...this.currentData,
                results: this.currentResults,
                description: document.getElementById('farmDescription').value,
                metadata: {
                    mode: this.currentData?.mode || 'advanced',
                    calculationDate: new Date().toISOString()
                }
            };

            const tags = document.getElementById('farmTags').value;
            if (tags) {
                farmData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }

            let result;
            // CHECK: Are we updating an existing farm?
            if (this.storage.currentFarmId) {
                console.log('Updating existing farm:', this.storage.currentFarmId);
                // We are updating
                result = this.storage.updateFarm(this.storage.currentFarmId, {
                    name: farmName,
                    ...farmData,
                    metadata: {
                        ...farmData.metadata,
                        updated: new Date().toISOString()
                    }
                });
                if (result.success) result.message = 'تم تحديث بيانات المزرعة بنجاح'; // Custom message
            } else {
                // We are creating new
                console.log('Saving new farm:', farmName);
                result = this.storage.saveFarm(farmData, farmName);
                if (result.success) {
                    // Set current ID so subsequent saves are updates
                    this.storage.currentFarmId = result.farmId;
                }
            }

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.closeSaveFarmModal();
                this.refreshFarmsManager();

                const saveBtn = document.querySelector('.save-btn');
                if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-check"></i> محفوظة`;

            } else {
                this.showNotification(`خطأ في الحفظ: ${result.error}`, 'error');
            }
        } catch (e) {
            console.error('Critical error in saveCurrentFarm:', e);
            this.showNotification('حدث خطأ غير متوقع. راجع الكونسول.', 'error');
        }
    }

    // ========================
    // واجهة تحميل المزرعة
    // ========================

    showLoadOptions() {
        const modal = document.getElementById('loadFarmModal') || this.createLoadModal();

        // تعبئة الحسابات الأخيرة
        this.populateRecentCalculations();

        modal.style.display = 'flex';
    }

    createLoadModal() {
        const modalHTML = `
            <div id="loadFarmModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-upload"></i> تحميل مزرعة</h3>
                        <button class="close-modal" onclick="storageIntegration.closeLoadFarmModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="load-options">
                            <div class="load-option" onclick="storageIntegration.loadFromRecent()">
                                <div class="option-icon"><i class="fas fa-history"></i></div>
                                <div class="option-content">
                                    <h4>الحسابات الأخيرة</h4>
                                    <p>تحميل من آخر الحسابات</p>
                                </div>
                            </div>
                            
                            <div class="load-option" onclick="storageIntegration.showFarmsManager()">
                                <div class="option-icon"><i class="fas fa-tractor"></i></div>
                                <div class="option-content">
                                    <h4>المزارع المحفوظة</h4>
                                    <p>اختر من قائمة المزارع</p>
                                </div>
                            </div>
                            
                            <div class="load-option" onclick="storageIntegration.importFromFile()">
                                <div class="option-icon"><i class="fas fa-file-import"></i></div>
                                <div class="option-content">
                                    <h4>استيراد من ملف</h4>
                                    <p>تحميل بيانات من ملف JSON</p>
                                </div>
                            </div>
                        </div>
                        
                        <h4 style="margin-bottom:10px; border-bottom: 2px solid var(--primary); display:inline-block;">أحدث الحسابات</h4>
                        <div class="recent-calculations" id="recentCalculationsList">
                            <!-- سيتم تعبئته بالجافاسكريبت -->
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn" onclick="storageIntegration.closeLoadFarmModal()">إغلاق</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById('loadFarmModal');
    }

    populateRecentCalculations() {
        const container = document.getElementById('recentCalculationsList');
        if (!container) return;

        const calculations = this.storage.getCalculationsHistory(10);

        if (calculations.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">لا توجد حسابات سابقة</p>';
            return;
        }

        container.innerHTML = calculations.map(calc => {
            let cropName = calc.crop;
            if (agricultureDatabase.crops[calc.crop]) cropName = agricultureDatabase.crops[calc.crop].name;

            return `
            <div class="recent-calculation" onclick="storageIntegration.loadCalculation('${calc.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong><i class="fas fa-seedling"></i> ${cropName || 'غير معروف'}</strong>
                        <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                            ${new Date(calc.timestamp).toLocaleDateString('ar-SA')} | ${new Date(calc.timestamp).toLocaleTimeString('ar-SA')}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: var(--primary);">${calc.waterRequirements?.dailyGross || calc.waterRequired || '?'} م³</div>
                        <div style="font-size: 0.8rem; color: #4CAF50;">
                            ${calc.efficiencyScore || calc.efficiency || '?'}% كفاءة
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    loadFromRecent() {
        // Already shown in the modal, maybe scroll to it?
        const list = document.getElementById('recentCalculationsList');
        if (list) list.scrollIntoView({ behavior: 'smooth' });
    }

    loadCalculation(calcId) {
        const calculations = this.storage.getCalculationsHistory(1000);
        const calculation = calculations.find(c => c.id === calcId);

        if (calculation) {
            this.populateFormWithData(calculation);
            this.closeLoadFarmModal();
            // Switch to input mode to show loaded data
            if (window.switchMode) window.switchMode('advanced');
            alert('تم تحميل البيانات بنجاح');
        }
    }

    populateFormWithData(data) {
        // تعبئة حقول النموذج بالبيانات المحملة
        // Basic Fields
        if (data.crop) {
            const cropSelect = document.getElementById('basicCrops') ? null : document.getElementById('advCrop');
            if (document.getElementById('advCrop')) document.getElementById('advCrop').value = data.crop;
            // Trigger change to load crop details
            if (typeof loadCropDetails === 'function') loadCropDetails();

            // For basic mode icons
            if (window.irrigationSystem && window.irrigationSystem.ui && window.irrigationSystem.ui.selectBasicCrop) {
                // Find element
                const el = document.getElementById(`crop-${data.crop}`);
                if (el) window.irrigationSystem.ui.selectBasicCrop(data.crop, el);
            }
        }

        if (data.area) {
            if (document.getElementById('basicArea')) document.getElementById('basicArea').value = data.area;
            if (document.getElementById('advArea')) document.getElementById('advArea').value = data.area;
        }

        if (data.region) {
            if (document.getElementById('basicRegion')) document.getElementById('basicRegion').value = data.region;
            if (document.getElementById('advRegion')) document.getElementById('advRegion').value = data.region;
        }

        // Advanced Fields
        this.updateFormWithAdvancedData(data);
    }

    updateFormWithAdvancedData(data) {
        // تحديث الحقول المتقدمة
        const mapping = {
            'advSoilType': 'soilType',
            'advTemperature': 'temperature',
            'advHumidity': 'humidity',
            'advGrowthStage': 'growthStage',
            'advRootDepth': 'rootDepth',
            'advWindSpeed': 'windSpeed',
            'advSunHours': 'sunHours',
            'advIrrigationType': 'systemType',
            'advSystemEfficiency': 'systemEfficiency'
        };

        Object.entries(mapping).forEach(([elementId, dataKey]) => {
            const el = document.getElementById(elementId);
            if (el && data[dataKey] !== undefined) el.value = data[dataKey];
        });

        // Trigger updates
        if (typeof updateSoilFields === 'function') updateSoilFields();
        if (typeof updateSystemFields === 'function') updateSystemFields();
    }

    closeLoadFarmModal() {
        const modal = document.getElementById('loadFarmModal');
        if (modal) modal.style.display = 'none';
    }

    // ========================
    // واجهة إدارة المزارع
    // ========================

    showFarmsManager() {
        // Close other modals if open
        this.closeLoadFarmModal();
        this.closeSaveFarmModal();

        const manager = document.getElementById('farmsManager') || this.createFarmsManager();

        manager.style.display = 'block';
        this.refreshFarmsManager();

        // إطلاق حدث
        document.dispatchEvent(new Event('farmsManagerOpened'));
    }

    createFarmsManager() {
        const managerHTML = `
            <div id="farmsManager">
                <div class="farms-manager-container">
                    <div class="farms-header">
                        <h2><i class="fas fa-tractor"></i> إدارة المزارع المحفوظة</h2>
                        <div class="header-actions">
                            <button class="btn btn-primary" onclick="storageIntegration.showSaveOptions()">
                                <i class="fas fa-plus"></i> حفظ مزرعة جديدة
                            </button>
                            <button class="btn btn-secondary" onclick="storageIntegration.exportAllFarms()">
                                <i class="fas fa-download"></i> تصدير الكل
                            </button>
                            <button class="btn btn-danger" onclick="storageIntegration.showClearConfirmation()">
                                <i class="fas fa-trash"></i> مسح الكل
                            </button>
                            <button class="btn" onclick="storageIntegration.hideFarmsManager()">
                                <i class="fas fa-times"></i> إغلاق
                            </button>
                        </div>
                    </div>
                    
                    <!-- شريط البحث والتصفية -->
                    <div class="farms-toolbar">
                        <div class="search-box">
                            <input type="text" id="farmSearch" placeholder="ابحث باسم المزرعة أو المحصول..." onkeyup="storageIntegration.filterFarms()">
                            <i class="fas fa-search"></i>
                        </div>
                        
                        <div class="filter-options">
                            <select id="filterCrop" onchange="storageIntegration.filterFarms()">
                                <option value="">كل المحاصيل</option>
                            </select>
                            
                            <select id="filterRegion" onchange="storageIntegration.filterFarms()">
                                <option value="">كل المناطق</option>
                                <option value="north">شمال</option>
                                <option value="coast">ساحلي</option>
                                <option value="desert">صحراوي</option>
                                <option value="mountain">جبلي</option>
                            </select>
                            
                            <select id="sortFarms" onchange="storageIntegration.sortFarms()">
                                <option value="updated">الأحدث</option>
                                <option value="created">الأقدم</option>
                                <option value="name">بالاسم</option>
                                <option value="size">بالمساحة</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- إحصائيات سريعة -->
                    <div class="farms-stats">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-tractor"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="totalFarms">0</div>
                                <div class="stat-label">مزرعة محفوظة</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calculator"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="totalCalculations">0</div>
                                <div class="stat-label">حساب تم إجراؤه</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-tint"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="totalWater">0</div>
                                <div class="stat-label">م³ تم حسابها</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-database"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="storageUsage">0</div>
                                <div class="stat-label">كيلوبايت مستخدمة</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- قائمة المزارع -->
                    <div class="farms-list" id="farmsListContainer">
                        <!-- سيتم تعبئته بالجافاسكريبت -->
                    </div>
                    
                    <!-- رسالة إذا لم يكن هناك مزارع -->
                    <div class="empty-state" id="emptyFarmsState" style="display: none;">
                        <div class="empty-icon">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <h3>لا توجد مزارع محفوظة</h3>
                        <p>احفظ مزرعتك الأولى لتبدأ في تنظيم حساباتك</p>
                        <button class="btn btn-primary" onclick="storageIntegration.showSaveOptions()">
                            <i class="fas fa-plus"></i> حفظ أول مزرعة
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', managerHTML);
        return document.getElementById('farmsManager');
    }

    hideFarmsManager() {
        const el = document.getElementById('farmsManager');
        if (el) el.style.display = 'none';
        // Revert to main view or whatever was active
    }

    refreshFarmsManager() {
        this.updateStatsDisplay();
        this.updateFarmsList();
        this.updateCropFilter();
    }

    updateStatsDisplay() {
        const stats = this.storage.updateStats();
        const userProfile = this.storage.getUserProfile();

        const elTotalFarms = document.getElementById('totalFarms');
        if (elTotalFarms) elTotalFarms.textContent = stats.totalFarms;

        const elTotalCalcs = document.getElementById('totalCalculations');
        if (elTotalCalcs) elTotalCalcs.textContent = stats.totalCalculations;

        const elTotalWater = document.getElementById('totalWater');
        if (elTotalWater) elTotalWater.textContent = (userProfile.stats?.totalWaterCalculated || 0).toFixed(0);

        const elStorage = document.getElementById('storageUsage');
        if (elStorage) elStorage.textContent = stats.storageUsage.kilobytes;
    }

    updateFarmsList() {
        const container = document.getElementById('farmsListContainer');
        const emptyState = document.getElementById('emptyFarmsState');

        if (!container) return;

        const farms = this.storage.getFarmsList();

        if (farms.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'grid';
        container.innerHTML = farms.map(farm => this.createFarmCard(farm)).join('');
    }

    createFarmCard(farm) {
        const date = new Date(farm.metadata?.updated || farm.metadata?.created);
        const formattedDate = date.toLocaleDateString('ar-SA');
        let cropName = farm.crop;
        if (typeof agricultureDatabase !== 'undefined' && agricultureDatabase.crops[farm.crop]) {
            cropName = agricultureDatabase.crops[farm.crop].name;
        }

        // Translation Helper
        const translate = (key) => {
            const map = {
                // Area Units
                'hectare': 'هكتار',
                'acre': 'فدان',
                'dunam': 'دونم',
                // Regions
                'north': 'الشمال (معتدل)',
                'coast': 'الساحل (رطب)',
                'desert': 'الصحراء (جاف)',
                'mountain': 'الجبال (بارد)',
                'undefined': 'غير محدد',
                // Systems
                'drip': 'ري بالتنقيط',
                'sprinkler': 'ري بالرش',
                'surface': 'ري سطحي',
                'manual': 'ري يدوي',
                'pivot': 'ري محوري',
                // Soil
                'sandy': 'رملية',
                'loam': 'سلتية',
                'clay': 'طينية'
            };
            return map[key] || key;
        };

        // Robust Water Value Extraction
        let waterVal = 0;
        if (farm.waterRequired) {
            waterVal = parseFloat(farm.waterRequired);
        } else if (farm.results) {
            if (farm.results.dailyWater) {
                waterVal = parseFloat(farm.results.dailyWater);
            } else if (farm.results.waterRequirements && farm.results.waterRequirements.dailyGross) {
                waterVal = parseFloat(farm.results.waterRequirements.dailyGross);
            } else if (farm.waterRequirements && farm.waterRequirements.dailyGross) {
                waterVal = parseFloat(farm.waterRequirements.dailyGross);
            }
        }

        return `
            <div class="farm-card">
                <div class="farm-header">
                    <div>
                        <div class="farm-name">${farm.name}</div>
                        <div class="farm-crop">
                            <i class="fas fa-seedling"></i>
                            ${cropName || 'غير محدد'}
                        </div>
                    </div>
                    <div class="farm-actions">
                        <button class="farm-action-btn" onclick="storageIntegration.loadFarm('${farm.id}')" 
                                title="تحميل">
                            <i class="fas fa-upload"></i>
                        </button>
                        <button class="farm-action-btn" onclick="event.stopPropagation(); storageIntegration.editFarm('${farm.id}')" 
                                title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="farm-action-btn" onclick="event.stopPropagation(); storageIntegration.deleteFarm('${farm.id}')" 
                                title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="farm-details">
                    <div class="farm-detail-item">
                        <span class="farm-detail-label">المساحة:</span>
                        <span class="farm-detail-value">${farm.area || 0} ${translate(farm.areaUnit) || 'هكتار'}</span>
                    </div>
                    <div class="farm-detail-item">
                        <span class="farm-detail-label">المنطقة:</span>
                        <span class="farm-detail-value">${translate(farm.region) || 'غير محدد'}</span>
                    </div>
                    <div class="farm-detail-item">
                        <span class="farm-detail-label">نظام الري:</span>
                        <span class="farm-detail-value">${translate(farm.system || farm.systemType) || 'غير محدد'}</span>
                    </div>
                     <div class="farm-detail-item">
                        <span class="farm-detail-label">الاحتياج المائي:</span>
                        <span class="farm-detail-value" dir="ltr">${waterVal > 0 ? waterVal.toFixed(2) + ' م³/يوم' : '0'}</span>
                    </div>
                    <div class="farm-detail-item">
                        <span class="farm-detail-label">آخر تحديث:</span>
                        <span class="farm-detail-value">${formattedDate}</span>
                    </div>
                </div>
                
                ${farm.tags && farm.tags.length > 0 ?
                `<div class="farm-tags">
                        ${farm.tags.map(tag => `<span class="farm-tag">${tag}</span>`).join('')}
                    </div>`
                : ''}
            </div>
        `;
    }

    updateCropFilter() {
        const filterSelect = document.getElementById('filterCrop');
        if (!filterSelect) return;

        const farms = this.storage.getFarmsList();
        const crops = [...new Set(farms.map(farm => farm.crop).filter(Boolean))];

        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="">كل المحاصيل</option>';

        crops.forEach(crop => {
            const cropName = agricultureDatabase.crops[crop]?.name || crop;
            const option = document.createElement('option');
            option.value = crop;
            option.textContent = cropName;
            filterSelect.appendChild(option);
        });

        filterSelect.value = currentValue;
    }

    filterFarms() {
        const searchTerm = document.getElementById('farmSearch')?.value.toLowerCase() || '';
        const cropFilter = document.getElementById('filterCrop')?.value || '';
        const regionFilter = document.getElementById('filterRegion')?.value || '';

        const farms = this.storage.getFarmsList();

        const filteredFarms = farms.filter(farm => {
            let cropName = farm.crop;
            if (agricultureDatabase.crops[farm.crop]) cropName = agricultureDatabase.crops[farm.crop].name;

            // البحث بالنص
            if (searchTerm && !farm.name.toLowerCase().includes(searchTerm) &&
                !(cropName && cropName.toLowerCase().includes(searchTerm))) {
                return false;
            }

            // التصفية بالمحصول
            if (cropFilter && farm.crop !== cropFilter) {
                return false;
            }

            // التصفية بالمنطقة
            if (regionFilter && farm.region !== regionFilter) {
                return false;
            }

            return true;
        });

        this.displayFilteredFarms(filteredFarms);
    }

    displayFilteredFarms(farms) {
        const container = document.getElementById('farmsListContainer');
        const emptyState = document.getElementById('emptyFarmsState');

        if (farms.length === 0) {
            container.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
                emptyState.innerHTML = `
                    <div class="empty-icon"><i class="fas fa-search"></i></div>
                    <h3>لا توجد نتائج</h3>
                    <p>حاول البحث بمصطلحات أخرى</p>
                `;
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'grid';
        container.innerHTML = farms.map(farm => this.createFarmCard(farm)).join('');
    }

    sortFarms() {
        const sortBy = document.getElementById('sortFarms')?.value || 'updated';
        const farms = this.storage.getFarmsList(sortBy);
        this.displayFilteredFarms(farms);
    }

    // ========================
    // عمليات المزارع
    // ========================

    loadFarm(farmId) {
        const farm = this.storage.getFarm(farmId);

        if (!farm) {
            alert('المزرعة غير موجودة');
            return;
        }

        this.populateFormWithData(farm);
        this.currentData = farm;
        this.currentResults = farm.results;

        this.storage.currentFarmId = farmId;
        this.hideFarmsManager();

        if (window.switchMode) window.switchMode('advanced'); // Force switch to view data

        alert(`تم تحميل مزرعة "${farm.name}" بنجاح`);
    }

    // ========================
    // إدارة تعديل مزرعة واحدة (محدث)
    // ========================

    showEditFarmModal(farmId) {
        const farm = this.storage.getFarm(farmId);
        if (!farm) return;

        this.pendingEditId = farmId;

        let modal = document.getElementById('editFarmModal');
        if (!modal) {
            const modalHTML = `
                <div id="editFarmModal" class="modal">
                    <div class="modal-content" style="max-width: 400px; text-align: center;">
                        <div class="modal-header" style="justify-content: center; border-bottom: none; padding-bottom: 0;">
                            <i class="fas fa-edit" style="font-size: 3rem; color: #2196F3; margin-bottom: 10px;"></i>
                        </div>
                        <div class="modal-body">
                            <h3 style="margin-bottom: 10px; color: #333;">تعديل اسم المزرعة</h3>
                            <div class="input-group" style="margin-top: 15px;">
                                <input type="text" id="editFarmNameInput" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="اسم المزرعة الجديد">
                            </div>
                        </div>
                        <div class="modal-footer" style="justify-content: center; gap: 15px; border-top: none; padding-top: 0;">
                            <button class="btn btn-secondary" onclick="storageIntegration.closeEditFarmModal()">إلغاء</button>
                            <button class="btn btn-primary" onclick="storageIntegration.saveEditFarm()">
                                <i class="fas fa-save"></i> حفظ التعديل
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById('editFarmModal');
        }

        const input = document.getElementById('editFarmNameInput');
        if (input) input.value = farm.name;

        modal.style.display = 'flex';
    }

    closeEditFarmModal() {
        const modal = document.getElementById('editFarmModal');
        if (modal) modal.style.display = 'none';
        this.pendingEditId = null;
    }

    saveEditFarm() {
        if (!this.pendingEditId) return;

        const input = document.getElementById('editFarmNameInput');
        const newName = input ? input.value : '';

        if (newName && newName.trim()) {
            this.storage.updateFarm(this.pendingEditId, { name: newName.trim() });
            this.refreshFarmsManager();
            this.closeEditFarmModal();
            // Simple toast or alert
            // alert('تم تحديث الاسم بنجاح');
        } else {
            alert('يرجى إدخال اسم صحيح');
        }
    }

    editFarm(farmId) {
        this.showEditFarmModal(farmId);
    }

    // ========================
    // إدارة حذف مزرعة واحدة (محدث)
    // ========================

    showDeleteConfirmModal(farmId) {
        const farm = this.storage.getFarm(farmId);
        if (!farm) return;

        this.pendingDeleteId = farmId; // Store ID for confirmation action

        // Check if modal exists, otherwise create it
        let modal = document.getElementById('deleteFarmModal');
        if (!modal) {
            const modalHTML = `
                <div id="deleteFarmModal" class="modal">
                    <div class="modal-content" style="max-width: 400px; text-align: center;">
                        <div class="modal-header" style="justify-content: center; border-bottom: none; padding-bottom: 0;">
                            <i class="fas fa-trash-alt" style="font-size: 3rem; color: #f44336; margin-bottom: 10px;"></i>
                        </div>
                        <div class="modal-body">
                            <h3 style="margin-bottom: 10px; color: #333;">حذف المزرعة</h3>
                            <p style="color: #666; font-size: 1rem; line-height: 1.5;" id="deleteFarmMsg">
                                هل أنت متأكد من حذف هذه المزرعة؟
                            </p>
                        </div>
                        <div class="modal-footer" style="justify-content: center; gap: 15px; border-top: none; padding-top: 0;">
                            <button class="btn btn-secondary" onclick="storageIntegration.closeDeleteConfirmModal()">إلغاء</button>
                            <button class="btn btn-danger" onclick="storageIntegration.performDeleteFarm()">
                                <i class="fas fa-trash-alt"></i> حذف
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById('deleteFarmModal');
        }

        // Update message
        const msgEl = document.getElementById('deleteFarmMsg');
        if (msgEl) msgEl.innerHTML = `هل أنت متأكد من حذف مزرعة <b>"${farm.name}"</b>؟<br>لا يمكن التراجع عن هذا.`;

        modal.style.display = 'flex';
    }

    closeDeleteConfirmModal() {
        const modal = document.getElementById('deleteFarmModal');
        if (modal) modal.style.display = 'none';
        this.pendingDeleteId = null;
    }

    performDeleteFarm() {
        if (!this.pendingDeleteId) return;

        const result = this.storage.deleteFarm(this.pendingDeleteId);
        this.closeDeleteConfirmModal();

        if (result.success) {
            // this.showNotification(result.message, 'success'); // If showNotification exists, use it
            alert(result.message); // Fallback to alert for success message
            this.refreshFarmsManager();

            // If we deleted the currently viewed farm, clear view
            if (this.storage.currentFarmId === this.pendingDeleteId) {
                this.storage.currentFarmId = null;
                this.currentData = null;
                this.currentResults = null;
            }
        } else {
            alert(result.error || 'حدث خطأ');
        }
    }

    deleteFarm(farmId) {
        this.showDeleteConfirmModal(farmId);
    }

    // ========================
    // إدارة مسح الكل
    // ========================

    showClearConfirmation() {
        const modal = document.getElementById('clearConfirmModal') || this.createClearConfirmModal();
        modal.style.display = 'flex';
    }

    createClearConfirmModal() {
        const modalHTML = `
            <div id="clearConfirmModal" class="modal">
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <div class="modal-header" style="justify-content: center; border-bottom: none; padding-bottom: 0;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f44336; margin-bottom: 10px;"></i>
                    </div>
                    
                    <div class="modal-body">
                        <h3 style="margin-bottom: 10px; color: #333;">هل أنت متأكد؟</h3>
                        <p style="color: #666; font-size: 1rem; line-height: 1.5;">
                            سيتم حذف جميع المزارع والحسابات والسجلات نهائياً.<br>
                            <b>لا يمكن التراجع عن هذا الإجراء!</b>
                        </p>
                    </div>
                    
                    <div class="modal-footer" style="justify-content: center; gap: 15px; border-top: none; padding-top: 0;">
                        <button class="btn btn-secondary" onclick="storageIntegration.closeClearConfirmModal()">إلغاء</button>
                        <button class="btn btn-danger" onclick="storageIntegration.clearAllFarms()">
                            <i class="fas fa-trash-alt"></i> نعم، مسح الكل
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById('clearConfirmModal');
    }

    closeClearConfirmModal() {
        const modal = document.getElementById('clearConfirmModal');
        if (modal) modal.style.display = 'none';
    }

    clearAllFarms() {
        // إغلاق المودال
        this.closeClearConfirmModal();

        // تنفيذ الحذف
        const result = this.storage.clearAllFarms();

        if (result.success) {
            this.showNotification(result.message, 'success');

            // تحديث الواجهة
            this.refreshFarmsManager();
            this.populateRecentCalculations();

            // تحديث الإحصائيات في القائمة العلوية
            const savedCountElement = document.getElementById('savedFarmsCount');
            if (savedCountElement) savedCountElement.innerText = '0';

        } else {
            this.showNotification('حدث خطأ أثناء المسح', 'error');
        }
    }

    // ========================
    // وظائف تلقائية
    // ========================

    autoSaveCalculation() {
        if (!this.currentData || !this.currentResults) return;

        const calculationData = {
            crop: this.currentData.crop,
            waterRequired: this.currentResults.waterRequirements?.dailyGross || 0,
            efficiency: this.currentResults.efficiencyScore || 0,
            duration: this.currentResults.irrigationSchedule?.duration || 0,
            frequency: this.currentResults.irrigationSchedule?.frequency?.interval || 0
        };

        this.storage.saveCalculation(calculationData, this.storage.currentFarmId);
    }

    autoSaveChanges() {
        const currentFormData = this.collectFormData();
        if (!currentFormData || !this.storage.currentFarmId) return;

        this.storage.updateFarm(this.storage.currentFarmId, {
            ...currentFormData,
            metadata: {
                updated: new Date().toISOString()
            }
        });
    }

    collectFormData() {
        if (window.irrigationSystem && window.irrigationSystem.ui) {
            // Using existing collectors from new_architecture.js
            return document.getElementById('advancedMode').style.display === 'block'
                ? window.irrigationSystem.ui.collectAdvancedData()
                : window.irrigationSystem.ui.collectBasicData();
        }
        return {};
    }

    // ========================
    // إعدادات المستخدم
    // ========================

    loadUserPreferences() {
        const settings = this.storage.getSettings();
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
}
