
// ==========================================
// MawasemTech Smart Irrigation System - New Architecture
// Consolidated Logic from irrigation.html
// ==========================================

// === Helper Functions (Global) ===
function selectBasicCrop(cropId, element) {
    if (window.irrigationSystem) {
        window.irrigationSystem.ui.selectBasicCrop(cropId, element);
    }
}

function calculateBasic() {
    if (window.irrigationSystem) {
        window.irrigationSystem.handleBasicCalculation();
    } else {
        alert("النظام قيد التحميل... الرجاء الانتظار");
    }
}

function calculateAdvanced() {
    if (window.irrigationSystem) {
        window.irrigationSystem.handleAdvancedCalculation();
    } else {
        alert("النظام قيد التحميل... الرجاء الانتظار");
    }
}

function switchMode(mode) {
    if (window.irrigationSystem && window.irrigationSystem.ui) {
        window.irrigationSystem.ui.switchMode(mode);
    }
}

function updateRootDepth() {
    const cropId = document.getElementById('advCrop').value;
    const stage = document.getElementById('advGrowthStage').value;
    const crop = agricultureDatabase.crops[cropId];

    if (crop && crop.rootSystem) {
        const maxDepth = crop.rootSystem.depth.typical || 40;

        // Factors for growth stages
        const stageFactors = {
            'initial': 0.3,     // 30% of max depth
            'development': 0.7, // 70% of max depth
            'mid': 1.0,         // 100% of max depth
            'late': 1.0         // 100% of max depth (roots don't shrink)
        };

        const factor = stageFactors[stage] || 1.0;
        const currentDepth = Math.round(maxDepth * factor);

        const rootInput = document.getElementById('advRootDepth');
        if (rootInput) rootInput.value = currentDepth;
    }
}

function loadCropDetails() {
    const cropId = document.getElementById('advCrop').value;
    if (!cropId) return;

    // Call the dynamic depth updater
    updateRootDepth();
}

function updateSoilFields() {
    const soilType = document.getElementById('advSoilType').value;
    const customFields = document.getElementById('customSoilFields');
    if (customFields) {
        customFields.style.display = (soilType === 'custom') ? 'block' : 'none';
    }
}

function updateSystemFields() {
    const systemType = document.getElementById('advIrrigationType').value;
    const dripFields = document.getElementById('dripFields');
    const sprinklerFields = document.getElementById('sprinklerFields');
    const efficiencyInput = document.getElementById('advSystemEfficiency');

    if (dripFields) dripFields.style.display = (systemType === 'drip') ? 'block' : 'none';
    if (sprinklerFields) sprinklerFields.style.display = (systemType === 'sprinkler') ? 'block' : 'none';

    // Auto-update efficiency
    if (agricultureDatabase.irrigationSystems[systemType] && efficiencyInput) {
        // Convert 0.90 to 90
        efficiencyInput.value = Math.round(agricultureDatabase.irrigationSystems[systemType].efficiency * 100);
    }
}

function toggleSpecialFactors() {
    const section = document.getElementById('specialFactors');
    const btn = document.getElementById('toggleSpecialFactorsBtn');
    if (section) section.classList.toggle('show');
    if (btn) btn.classList.toggle('active');
}

// === Calculation Classes ===

class PenmanMonteith {
    calculateETo(params) {
        const Tmax = params.Tmax || 30;
        const Tmin = params.Tmin || 20;
        const RHmean = params.RHmean || 50;
        const u2 = params.u2 || 2;
        const Rs = params.Rs || 20;
        const altitude = params.altitude || 100;
        const J = params.J || 1;

        const Tmean = (Tmax + Tmin) / 2;
        const es = 0.6108 * Math.exp((17.27 * Tmean) / (Tmean + 237.3));
        const ea = es * (RHmean / 100);
        const delta = 4098 * es / Math.pow((Tmean + 237.3), 2);
        const P = 101.3 * Math.pow((293 - 0.0065 * altitude) / 293, 5.26);
        const gamma = 0.665 * Math.pow(10, -3) * P;

        const Rns = this.calculateNetShortwaveRadiation(Rs);
        const Rnl = this.calculateNetLongwaveRadiation(Tmax, Tmin, ea, Rs);
        const Rn = Rns - Rnl;
        const G = 0;

        const numerator = 0.408 * delta * (Rn - G) + gamma * (900 / (Tmean + 273)) * u2 * (es - ea);
        const denominator = delta + gamma * (1 + 0.34 * u2);

        return Math.max(0.5, numerator / denominator);
    }

    calculateNetShortwaveRadiation(Rs) {
        const albedo = 0.23;
        return (1 - albedo) * Rs;
    }

    calculateNetLongwaveRadiation(Tmax, Tmin, ea, Rs) {
        const Rso = 0.75 * 25;
        const ratio = Math.min(1.0, Rs / Rso);
        const TmaxK = Tmax + 273.16;
        const TminK = Tmin + 273.16;
        const term1 = (Math.pow(TmaxK, 4) + Math.pow(TminK, 4)) / 2;
        const term2 = 0.34 - 0.14 * Math.sqrt(Math.max(0, ea));
        const term3 = 1.35 * ratio - 0.35;
        return 4.903 * Math.pow(10, -9) * term1 * term2 * term3;
    }
}

class HargreavesEquation {
    calculateETo(Tmax, Tmin, Ra) {
        const Tmean = (Tmax + Tmin) / 2;
        const TR = Tmax - Tmin;
        return 0.0023 * (Tmean + 17.8) * Math.sqrt(TR) * Ra * 0.408;
    }
}

class SoilWaterBalance {
    calculateAvailableWater(soilType, rootDepth, depletionFactor = 0.5) {
        const soilData = {
            sandy: { FC: 0.10, PWP: 0.03 },
            loam: { FC: 0.25, PWP: 0.10 },
            clay: { FC: 0.35, PWP: 0.15 },
            custom: { FC: 0.20, PWP: 0.08 }
        };
        const soil = soilData[soilType] || soilData.loam;
        const availableWater = (soil.FC - soil.PWP) * rootDepth * 10;
        return availableWater * depletionFactor;
    }
}

class IrrigationFormulas {
    calculateSystemPressure(systemType) {
        if (systemType === 'drip') return 1.5;
        if (systemType === 'sprinkler') return 3.0;
        return 0.5;
    }

    calculateDistributionUniformity(systemType, maintenance = 'good') {
        const baseEfficiencies = { drip: 0.90, sprinkler: 0.75, surface: 0.60, manual: 0.50 };
        const maintenanceFactors = { excellent: 1.0, good: 0.95, fair: 0.85, poor: 0.70 };
        return (baseEfficiencies[systemType] || 0.75) * (maintenanceFactors[maintenance] || 0.85);
    }
}

class CropWaterRequirement {
    calculateKc(cropType, growthStage) {
        const crop = agricultureDatabase.crops[cropType];
        if (!crop) return 1.0;
        if (crop.kcValues && crop.kcValues[growthStage]) {
            return crop.kcValues[growthStage].kc;
        }
        return 1.0;
    }
}

class SmartIrrigationCalculator {
    constructor() {
        this.pm = new PenmanMonteith();
        this.hargreaves = new HargreavesEquation();
        this.soilBalance = new SoilWaterBalance();
        this.irrigationFormulas = new IrrigationFormulas();
        this.cropReq = new CropWaterRequirement();
    }

    estimateSolarRadiation(sunHours) {
        const Ra = 35;
        const N = 13;
        return (0.25 + 0.50 * (sunHours / N)) * Ra;
    }

    getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    }

    comprehensiveCalculation(params) {
        const soilDb = agricultureDatabase.soils[params.soilType];
        const cropDb = agricultureDatabase.crops[params.crop];
        const warnings = [];
        let recommendations = [];

        const Rs = this.estimateSolarRadiation(params.sunHours);
        const pmParams = {
            Tmax: params.temperature + 5,
            Tmin: params.temperature - 5,
            RHmean: params.humidity,
            u2: params.windSpeed * 0.278,
            Rs: Rs,
            altitude: 100,
            J: this.getDayOfYear()
        };

        const ETo = this.pm.calculateETo(pmParams);
        const Kc = this.cropReq.calculateKc(params.crop, params.growthStage);
        let ETc = ETo * Kc;

        let specialFactorAdjust = 1.0;
        if (params.mulch > 0) {
            specialFactorAdjust -= params.mulch;
            recommendations.push(`الغطاء الأرضي يوفر ${params.mulch * 100}% من المياه`);
        }
        if (params.salinity > 2) {
            specialFactorAdjust += 0.1;
            recommendations.push("زيادة مياه الغسيل بسبب الملوحة");
        }
        ETc = ETc * specialFactorAdjust;

        if (cropDb) {
            if (soilDb && soilDb.suitableCrops && !soilDb.suitableCrops.some(c => cropDb.name.includes(c))) {
                if (soilDb.unsuitableCrops && soilDb.unsuitableCrops.some(c => cropDb.name.includes(c))) {
                    warnings.push(`تحذير: التربة ${soilDb.name} قد لا تكون مناسبة لمحصول ${cropDb.name}.`);
                }
            }
            if (cropDb.waterRequirements && cropDb.waterRequirements.maxEC) {
                if (params.salinity > cropDb.waterRequirements.maxEC) {
                    warnings.push(`خطر الملوحة: ملوحة الماء (${params.salinity}) تتجاوز تحمل المحصول (${cropDb.waterRequirements.maxEC}). قلل الإنتاج متوقع.`);
                }
            }
        }

        let availableWater;
        if (soilDb) {
            availableWater = soilDb.waterProperties.availableWater * (params.rootDepth / 100) * 1000;
        } else {
            availableWater = this.soilBalance.calculateAvailableWater(params.soilType, params.rootDepth);
        }

        const mad = 0.5;
        const readilyAvailableWater = availableWater * mad;
        const irrigationInterval = readilyAvailableWater / ETc;

        const areaHectares = this.convertToHectares(params.area, params.areaUnit);
        const waterNet = ETc * 10 * areaHectares;
        const efficiency = this.irrigationFormulas.calculateDistributionUniformity(params.systemType);
        const waterGross = waterNet / efficiency;

        const totalFlow = (params.systemType === 'drip' ? 10 : 15) * areaHectares;
        const duration = totalFlow > 0 ? (waterGross / totalFlow).toFixed(1) : 0;

        return {
            ETo: ETo.toFixed(2),
            ETc: ETc.toFixed(2),
            waterRequirements: {
                dailyNet: waterNet.toFixed(2),
                dailyGross: waterGross.toFixed(2),
                weekly: (waterGross * 7).toFixed(2),
                monthly: (waterGross * 30).toFixed(2),
                efficiencyLoss: (waterGross - waterNet).toFixed(2)
            },
            irrigationSchedule: {
                duration: duration,
                frequency: {
                    interval: Math.max(1, Math.min(10, irrigationInterval)),
                    timesPerWeek: Math.ceil(7 / Math.max(1, irrigationInterval))
                },
                bestTime: "صباحاً باكراً (6-9 ص)"
            },
            recommendations: {
                factors: recommendations,
                frequency: `جدولة الري المقترحة: مرة كل ${Math.max(1, Math.floor(irrigationInterval))} يوم (حوالي ${Math.ceil(7 / Math.max(1, irrigationInterval))} مرات أسبوعياً)`,
                cropSpecific: cropDb ? `طبيعة الجذور: ${cropDb.rootSystem.pattern || 'عادية'}` : "تابع نمو المحصول بانتظام",
                systemSpecific: `حافظ على ضغط تشغيلي ${this.irrigationFormulas.calculateSystemPressure(params.systemType)} بار`,
                warnings: warnings
            },
            costEstimate: { daily: (waterGross * 0.5).toFixed(2), monthly: (waterGross * 15).toFixed(2), yearly: (waterGross * 180).toFixed(2) },
            efficiencyScore: Math.round(efficiency * 100)
        };
    }

    convertToHectares(amount, unit) {
        const conversions = { 'hectare': 1, 'acre': 0.404686, 'dunam': 0.1, 'squareMeter': 0.0001 };
        return amount * (conversions[unit] || 1);
    }

    basicCalculation(cropId, area, region, systemId, season) {
        const cropData = agricultureDatabase.crops[cropId] || irrigationDatabase.crops[cropId];
        const climateData = agricultureDatabase.climates?.[region] || agricultureDatabase.climates?.desert;

        // Use dynamic ETo from climate database if available, else fallback to region map
        let ETo = 5.0;
        if (climateData) {
            // First try to use the pre-defined ETo from the database
            if (climateData.ETo) {
                ETo = climateData.ETo;
            } else {
                // Only calculate if ETo is missing
                ETo = this.pm.calculateETo({
                    Tmax: climateData.avgTemp + 5,
                    Tmin: climateData.avgTemp - 5,
                    RHmean: climateData.avgHumidity,
                    u2: climateData.wind || 2, // Default wind if missing
                    Rs: (climateData.radiation || 20) * 1, // Default radiation
                    J: 150
                });
            }
        } else {
            const regionEToMap = { north: 4.5, coast: 5.0, desert: 7.5, mountain: 3.5 };
            ETo = regionEToMap[region] || 5.0;
        }

        let Kc = 1.0;
        if (cropData && cropData.kcValues) {
            // Priority to mid growth stage for basic calculation
            Kc = (typeof cropData.kcValues.mid === 'object') ? cropData.kcValues.mid.kc : (cropData.kcValues.mid || 1.0);
        }

        const efficiency = agricultureDatabase.irrigationSystems[systemId]?.efficiency || 0.85;
        const areaHectares = this.convertToHectares(area, document.getElementById('basicAreaUnit')?.value || 'squareMeter');

        const rawETc = ETo * Kc;
        const seasonFactors = { summer: 1.2, winter: 0.8, spring: 1.0, autumn: 0.9 };
        const ETc = rawETc * (seasonFactors[season] || 1.0);

        const waterNet = ETc * 10 * areaHectares;
        const waterGross = waterNet / efficiency;

        return {
            ETo: ETo.toFixed(1),
            ETc: ETc.toFixed(1),
            dailyWater: waterGross.toFixed(2),
            dailyNet: waterNet.toFixed(2),
            duration: (waterGross > 0 ? (waterGross / 10).toFixed(1) : "0"),
            sessions: 1,
            systemEfficiency: Math.round(efficiency * 100),
            recommendations: [
                `توصية الري: رية واحدة ${season === 'summer' ? 'صباحاً باكراً جداً' : 'في الصباح'}`,
                `نوع المحصول: ${cropData ? (cropData.arabicName || cropData.name) : cropId}`,
                `كفاءة النظام المستخدم: ${Math.round(efficiency * 100)}%`,
                `مستوى التبخر للمنطقة: ${ETo.toFixed(1)} ملم/يوم`
            ]
        };
    }
}

// === Dashboard & UI Classes ===

class ResultsDashboard {
    constructor(containerId) {
        this.container = document.getElementById('dashboardContainer') || document.getElementById(containerId);
        if (!this.container) {
            this.container = document.querySelector('.results-grid') || document.querySelector('.results-section');
        }
        this.charts = {};
    }

    displayResults(results, params) {
        this.container.innerHTML = this.generateDashboardHTML(results, params);
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                this.initializeCharts(results);
            }
            this.initializeInteractivity();
        }, 100);
    }

    generateDashboardHTML(results, params) {
        const efficiencyScore = results.efficiencyScore || results.systemEfficiency || 0;
        return `
            <div class="dashboard">
                <div class="status-bar">
                    <div class="status-item efficiency">
                        <div class="status-label">مؤشر كفاءة الري</div>
                        <div class="status-value ${this.getEfficiencyClass(efficiencyScore)}">${efficiencyScore}%</div>
                        <div class="status-progress"><div class="progress-fill" style="width: ${efficiencyScore}%"></div></div>
                    </div>
                    <div class="status-item">
                        <div class="status-label">الاحتياج المائي اليومي</div>
                        <div class="status-value">${results.waterRequirements?.dailyGross || results.dailyWater} <span style="font-size: 1rem;">م³</span></div>
                    </div>
                    <div class="status-item">
                        <div class="status-label">مدة الري المقترحة</div>
                        <div class="status-value">${results.irrigationSchedule?.duration || results.duration} <span style="font-size: 1rem;">ساعة</span></div>
                    </div>
                </div>
                <div class="charts-container">
                    <div class="chart-card"><h4>توزيع الاحتياج المائي</h4><canvas id="waterDistributionChart"></canvas></div>
                    <div class="chart-card"><h4>منحنى الاستهلاك المائي</h4><canvas id="waterTrendChart"></canvas></div>
                </div>
                <div class="detailed-recommendations">
                    <h3>التوصيات</h3>
                    <div class="action-steps">${this.generateActionSteps(results, params)}</div>
                </div>
            </div>
        `;
    }

    getEfficiencyClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    }

    initializeCharts(results) {
        this.createDistributionChart(results);
        this.createTrendChart(results);
    }

    createDistributionChart(results) {
        const ctx = document.getElementById('waterDistributionChart');
        if (!ctx) return;
        const net = parseFloat(results.waterRequirements?.dailyNet || results.dailyNet);
        const gross = parseFloat(results.waterRequirements?.dailyGross || results.dailyWater);
        if (this.charts.dist) this.charts.dist.destroy();
        this.charts.dist = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['الاحتياج الصافي', 'الفواقد'],
                datasets: [{ data: [net, gross - net], backgroundColor: ['#4CAF50', '#FF9800'] }]
            }
        });
    }

    createTrendChart(results) {
        const ctx = document.getElementById('waterTrendChart');
        if (!ctx) return;
        if (this.charts.trend) this.charts.trend.destroy();
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
                datasets: [{ label: 'الاحتياج (م³)', data: Array(7).fill(parseFloat(results.dailyWater || results.waterRequirements.dailyGross)), borderColor: '#4CAF50' }]
            }
        });
    }

    generateActionSteps(results, params) {
        let recs = results.recommendations || [];
        if (!Array.isArray(recs)) {
            let temp = [];
            if (recs.factors) temp = temp.concat(recs.factors);
            if (recs.frequency) temp.push(recs.frequency);
            if (recs.cropSpecific) temp.push(recs.cropSpecific);
            if (recs.systemSpecific) temp.push(recs.systemSpecific);
            if (recs.warnings) temp = temp.concat(recs.warnings);
            recs = temp;
        }
        return recs.map(rec => `<div class="action-step"><p>${rec}</p></div>`).join('');
    }

    initializeInteractivity() { }
}

class DatabaseManager {
    constructor() { this.db = agricultureDatabase; }
    getAllCrops() { return this.db.crops; }
    getAllSoils() { return this.db.soils; }
    getIrrigationSystems() { return this.db.irrigationSystems; }
}

class UIManager {
    constructor() { }

    populateCropOptions(crops) {
        const basicCropsDiv = document.getElementById('basicCrops');
        if (basicCropsDiv) {
            basicCropsDiv.innerHTML = Object.values(crops).map(crop => `
                <div class="crop-card" onclick="selectBasicCrop('${crop.id}', this)" id="crop-${crop.id}">
                    <div class="crop-icon">${crop.icon}</div>
                    <div class="crop-info">
                        <h4>${crop.name}</h4>
                        <p>${crop.type} - احتياج مائي: ${crop.waterRequirements?.level || 'متوسط'}</p>
                    </div>
                </div>
            `).join('');
        }
        const advSelect = document.getElementById('advCrop');
        if (advSelect) {
            advSelect.innerHTML = '<option value="">اختر المحصول</option>' +
                Object.values(crops).map(crop => `<option value="${crop.id}">${crop.icon} ${crop.name}</option>`).join('');
        }
    }

    selectBasicCrop(cropId, element) {
        window.selectedBasicCrop = cropId;
        document.querySelectorAll('.crop-card').forEach(c => c.classList.remove('selected'));
        if (element) element.classList.add('selected');
    }

    collectBasicData() {
        return {
            crop: window.selectedBasicCrop,
            area: parseFloat(document.getElementById('basicArea').value) || 0,
            region: document.getElementById('basicRegion').value,
            system: document.getElementById('basicIrrigationType').value,
            season: document.getElementById('basicSeason').value
        };
    }

    collectAdvancedData() {
        return {
            crop: document.getElementById('advCrop').value,
            area: parseFloat(document.getElementById('advArea')?.value) || parseFloat(document.getElementById('basicArea')?.value) || 0,
            areaUnit: 'hectare', // Advanced defaults to hectare for now or should add unit selector
            growthStage: document.getElementById('advGrowthStage').value,
            soilType: document.getElementById('advSoilType').value,
            rootDepth: parseFloat(document.getElementById('advRootDepth').value) || 40,
            temperature: parseFloat(document.getElementById('advTemperature').value) || 30,
            humidity: parseFloat(document.getElementById('advHumidity').value) || 50,
            windSpeed: parseFloat(document.getElementById('advWindSpeed').value) || 10,
            sunHours: parseFloat(document.getElementById('advSunHours').value) || 8,
            systemType: document.getElementById('advIrrigationType').value,
            mulch: parseFloat(document.getElementById('advMulch').value) || 0,
            salinity: parseFloat(document.getElementById('advSalinity').value) || 1.5,
            season: document.getElementById('basicSeason').value
        };
    }

    switchMode(mode) {
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));

        const activeSection = (mode === 'results') ? document.getElementById('resultsSection') : document.getElementById(mode + 'Mode');
        if (activeSection) {
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
        }

        if (mode === 'results') {
            const tab = document.getElementById('resultsTab');
            if (tab) tab.style.display = 'flex';
        }

        const btn = document.getElementById(mode + 'ModeBtn') || document.getElementById(mode + 'Tab');
        if (btn) btn.classList.add('active');
    }

    showError(msg) { alert('خطأ: ' + msg); }
}

class SmartLearningSystem {
    constructor() { this.profile = { type: 'beginner' }; }
    learnFromUserData(data, results) { return []; }
}

// === Main System Orchestrator ===

class SmartIrrigationSystem {
    constructor() {
        this.db = new DatabaseManager();
        this.ui = new UIManager();
        this.calculator = new SmartIrrigationCalculator();
        this.learning = new SmartLearningSystem();
        this.dashboard = new ResultsDashboard('resultsSection');
    }

    initialize() {
        this.ui.populateCropOptions(this.db.getAllCrops());

        // Initialize planting date
        const plantingDateInput = document.getElementById('advPlantingDate');
        if (plantingDateInput) {
            const today = new Date();
            plantingDateInput.value = today.toISOString().split('T')[0];
        }

        this.setupEventHandlers();

        // Add listener for dynamic root depth on stage change
        const stageSelect = document.getElementById('advGrowthStage');
        if (stageSelect) {
            stageSelect.addEventListener('change', () => {
                if (typeof updateRootDepth === 'function') updateRootDepth();
            });
        }
    }

    setupEventHandlers() {
        const basicBtn = document.querySelector('#basicMode .calculate-btn');
        if (basicBtn) basicBtn.onclick = (e) => { e.preventDefault(); this.handleBasicCalculation(); };
        const advBtn = document.querySelector('#advancedMode .calculate-btn');
        if (advBtn) advBtn.onclick = (e) => { e.preventDefault(); this.handleAdvancedCalculation(); };
    }

    handleBasicCalculation() {
        const data = this.ui.collectBasicData();
        if (!data.crop || !data.area || !data.region) {
            this.ui.showError("الرجاء إدخال كافة البيانات الأساسية واختيار المحصول");
            return;
        }
        const results = this.calculator.basicCalculation(data.crop, data.area, data.region, data.system, data.season);

        // Display using legacy helper or dashboard
        if (typeof displayBasicResults === 'function') {
            displayBasicResults(results, data);
        } else {
            this.dashboard.displayResults(results, data);
            this.ui.switchMode('results');
        }
    }

    handleAdvancedCalculation() {
        const data = this.ui.collectAdvancedData();
        if (!data.crop) { this.ui.showError("الرجاء اختيار المحصول"); return; }
        const results = this.calculator.comprehensiveCalculation(data);
        this.dashboard.displayResults(results, data);
        this.ui.switchMode('results');
    }
}

// Global Initialization
window.irrigationSystem = null;
window.addEventListener('load', () => {
    window.irrigationSystem = new SmartIrrigationSystem();
    window.irrigationSystem.initialize();
});
