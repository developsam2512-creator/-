// test_smart_logic.js - Golden Scenario (Citrus/Alkaline)
const fs = require('fs');
const path = require('path');

const dataContent = fs.readFileSync(path.join(__dirname, 'fertilizer_data.js'), 'utf8');
const logicContent = fs.readFileSync(path.join(__dirname, 'fertilizer_logic.js'), 'utf8');

const mockElements = {};
global.document = {
    addEventListener: () => { },
    querySelectorAll: () => [],
    getElementById: (id) => mockElements[id] ? { value: mockElements[id], closest: () => ({ parentNode: { insertBefore: () => { } } }) } : null,
    createElement: () => ({ style: {}, innerHTML: '', id: '' }),
};
global.window = {};

try {
    eval(dataContent);
    eval(logicContent);
} catch (e) {
    console.error("Error loading scripts:", e.message);
}

const calculator = new FertilizerCalculator();

console.log("✅ Scripts Loaded. Running Golden Scenario (Citrus/Alkaline)...\n");

const goldenInputs = {
    crop: 'citrus', // الحمضيات
    area: 5,
    areaUnit: 'hectare',
    treeCount: 2000, // Total trees (was plantDensity)

    // Soil Analysis (Alkaline Calcareous Soil)
    soilType: 'clay',
    clayPercent: 35,
    ph: 8.1, // High pH -> Iron blockage
    ec: 2.5, // Salinity -> Leaching required
    organicMatter: 0.8, // Low

    // Macros (ppm)
    soilN: 30,  // Low -> Needs Fertilization
    soilP: 65,  // High -> Antagonism Risk
    soilK: 180, // Medium

    // Micros (ppm)
    Fe: 2.5,   // Very Low (Critical < 4.5)
    Zn: 0.6,   // Very Low (Critical < 1.0)
    Mn: 5.0,   // OK
    B: 0.8,    // OK

    irrigation: 'drip',
    climate: 'hot'
};

try {
    const results = calculator.calculateAdvanced(goldenInputs);

    console.log("--- ANALYSIS REPORT ---");

    // 1. pH Check
    const phAlert = results.smartAnalysis.find(a => a.title.includes('قلوية'));
    console.log(`[pH 8.1] Alert: ${phAlert ? '✅ FOUND: ' + phAlert.message : '❌ MISSING'}`);

    // 2. Antagonism Check (P vs Zn)
    const antagAlert = results.smartAnalysis.find(a => a.title.includes('تضاد الفوسفور'));
    console.log(`[P High/Zn Low] Alert: ${antagAlert ? '✅ FOUND: ' + antagAlert.message : '❌ MISSING'}`);

    // 3. Density Check (Implicit in analyzeContext)
    const densityAlert = results.smartAnalysis.find(a => a.title.includes('كثافة'));
    // 2000 trees / 5 ha = 400 trees/ha. Threshold is > 600. So expect NO alert.
    if (!densityAlert) console.log("PASS ✅: No Density Alert (400 trees/ha is OK).");

    console.log("\n--- RECOMMENDATIONS ---");
    results.fertilizerRecommendations.forEach(r => {
        if (r.nutrient === 'Fe' || r.nutrient === 'Zn') {
            console.log(`- ${r.fertilizer}: ${r.actualAmount} ${r.unit} (${r.applicationMethod})`);
        }
    });

} catch (e) {
    console.error("Exec Error:", e.message);
}
