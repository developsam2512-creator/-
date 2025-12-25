// test_full_scenario.js - The "Winter Recovery" Challenge
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
} catch (e) { console.error("Load Error:", e); }

const calculator = new FertilizerCalculator();

console.log("🦁 RUNNING 'THE WINTER RECOVERY' CHALLENGE 🦁\n");

const inputs = {
    // 1. Basic
    crop: 'citrus',
    area: 1, areaUnit: 'hectare',

    // 2. Season & History (The Multipliers)
    season: 'winter',              // N*0.8, K*1.15
    previousYieldStatus: 'heavy',  // K*1.25 (Recovery)
    targetYield: 'max',            // All*1.4

    // 3. Soil (The Constraints)
    soilType: 'sandy',             // N Efficiency 0.6 -> Needs 1.66x more
    clayPercent: 5, sandPercent: 90,
    ph: 8.2,                       // Alkaline -> Iron Blockage
    ec: 3.5,                       // Saline -> Caution

    // 4. Analysis
    soilN: 10, soilP: 10, soilK: 100, // Poor soil
    Fe: 2.0, // Deficient

    irrigation: 'drip',
    climate: 'central'
};

const results = calculator.calculateAdvanced(inputs);

console.log("--- INPUT FACTORS ---");
console.log(`SEASON: Winter (N-20%, K+15%)`);
console.log(`HISTORY: Heavy (K+25% Recovery)`);
console.log(`TARGET: Max (All+40%)`);
console.log(`SOIL: Sandy (Low Retention, Needs more N)`);
console.log(`pH: 8.2 (Alkaline)`);

console.log("\n--- CALCULATED NEEDS (kg/ha) ---");
const getAmt = (n) => results.fertilizerRecommendations.find(r => r.nutrient === n)?.requiredAmount.toFixed(1) || 0;
// We look at 'requiredAmount' which effectively is the 'adjustedNeeds' after all factors
// Wait, 'calculateFertilizerAmounts' takes 'adjustedNeeds'. 
// Let's modify logic to expose 'baseNeeds' vs 'adjustedNeeds' in a real debug, but here we see final.

results.fertilizerRecommendations.forEach(r => {
    if (['N', 'P2O5', 'K2O'].includes(r.nutrient)) {
        console.log(`${r.nutrient}: ${r.actualAmount.toFixed(1)} kg (${r.fertilizer})`);
    }
});

console.log("\n--- SMART ANALYSIS ---");
results.smartAnalysis.forEach(a => {
    console.log(`[${a.type.toUpperCase()}] ${a.title}: ${a.message}`);
});
