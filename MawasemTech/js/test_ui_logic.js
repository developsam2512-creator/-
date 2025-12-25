// test_ui_logic.js - Verify UI Population
const fs = require('fs');
const path = require('path');

const dataContent = fs.readFileSync(path.join(__dirname, 'fertilizer_data.js'), 'utf8');
const logicContent = fs.readFileSync(path.join(__dirname, 'fertilizer_logic.js'), 'utf8');

// Mock DOM
const mockSelects = {
    'crop-type': { innerHTML: '', appendChild: () => { } },
    'crop-type-intermediate': { innerHTML: '', appendChild: () => { } },
    'crop-variety': {
        innerHTML: '', appendChild: (opt) => {
            if (!this.options) this.options = [];
            this.options.push(opt);
        }
    }
};

global.document = {
    addEventListener: () => { },
    querySelectorAll: () => [],
    getElementById: (id) => mockSelects[id] || null,
    createElement: (tag) => ({ tagName: tag, value: '', textContent: '' })
};
global.window = {};

try {
    eval(dataContent);
    eval(logicContent);
} catch (e) { console.error(e); }

console.log("Testing initializeCropSelect()...");
try {
    initializeCropSelect();

    // Check Advanced Select
    const advSelect = mockSelects['crop-variety'];
    if (advSelect.options && advSelect.options.length > 0) {
        console.log(`PASS ✅: Advanced Crop Select populated with ${advSelect.options.length} options.`);
        console.log(`Sample Option: ${advSelect.options[0].textContent}`);
    } else {
        console.log("FAIL ❌: Advanced Crop Select is empty.");
    }
} catch (e) {
    console.error("Test Error:", e.message);
}
