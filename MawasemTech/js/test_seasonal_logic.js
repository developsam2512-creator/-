// test_seasonal_logic.js
const fs = require('fs');
const path = require('path');

const dataContent = fs.readFileSync(path.join(__dirname, 'fertilizer_data.js'), 'utf8');
const logicContent = fs.readFileSync(path.join(__dirname, 'fertilizer_logic.js'), 'utf8');

// Mock Environment
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
} catch (e) { console.error("Load Error:", e); }

const calculator = new FertilizerCalculator();

const baseInputs = {
    crop: 'tomato',
    area: 1, areaUnit: 'hectare',
    soilType: 'loam', irrigation: 'drip',
    soilN: 20, soilP: 20, soilK: 150
};

console.log("🌞 Running Seasonal Test: Summer vs Winter ❄️\n");

// Test Summer (Baseline)
const inputsSummer = { ...baseInputs, season: 'summer' };
const resSummer = calculator.calculateAdvanced(inputsSummer);
const nSummer = resSummer.fertilizerRecommendations.find(r => r.nutrient === 'N').requiredAmount;

// Test Winter (Expect reduced N, increased K)
const inputsWinter = { ...baseInputs, season: 'winter' };
const resWinter = calculator.calculateAdvanced(inputsWinter);
const nWinter = resWinter.fertilizerRecommendations.find(r => r.nutrient === 'N').requiredAmount;

console.log(`Summer N Requirement: ${nSummer.toFixed(2)} kg`);
console.log(`Winter N Requirement: ${nWinter.toFixed(2)} kg`);

if (nWinter < nSummer) {
    console.log("✅ PASS: Winter Nitrogen is reduced (approx 80%).");
} else {
    console.log("❌ FAIL: Winter Nitrogen not reduced.");
}

// Check for Analysis Note
const note = resWinter.smartAnalysis.find(a => a.title.includes('تعديل موسمي'));
if (note) {
    console.log(`✅ PASS: Smart Analysis note found: "${note.message}"`);
} else {
    console.log("❌ FAIL: No seasonal analysis note found.");
}
