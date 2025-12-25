/**
 * irrigation_logic.js
 * Smart Irrigation Calculator Engine
 * Implements FAO-56 Style Logic (simplified): ETc = ETo * Kc * Efficiency
 */

class IrrigationCalculator {

    constructor() {
        this.data = {
            // Average ETo (mm/day) for Saudi Regions (Approximate)
            ETO_TABLE: {
                'central': { 'summer': 12, 'winter': 5, 'spring': 8, 'fall': 7 }, // Riyadh
                'north': { 'summer': 11, 'winter': 4, 'spring': 7, 'fall': 6 },   // Jawf/Tabuk
                'south': { 'summer': 8, 'winter': 6, 'spring': 7, 'fall': 7 },    // Jizan/Najran
                'east': { 'summer': 13, 'winter': 6, 'spring': 9, 'fall': 8 },    // Dammam
                'west': { 'summer': 10, 'winter': 7, 'spring': 9, 'fall': 8 },    // Jeddah/Madinah
                'default': { 'summer': 10, 'winter': 5, 'spring': 8, 'fall': 7 }
            },
            // Crop Coefficients (Kc) - General averages per type if detailed data missing
            KC_DEFAULTS: {
                'vegetable': { 'initial': 0.5, 'mid': 1.05, 'end': 0.8 },
                'tree': { 'initial': 0.6, 'mid': 0.95, 'end': 0.85 },
                'field': { 'initial': 0.4, 'mid': 1.15, 'end': 0.6 },
                'date_palm': { 'initial': 0.8, 'mid': 1.0, 'end': 1.0 }, // Constant high
                'alfalfa': { 'initial': 0.4, 'mid': 1.2, 'end': 1.1 }   // High water user
            },
            // Irrigation System Efficiency
            EFFICIENCY: {
                'drip': 0.90, // 90%
                'sprinkler': 0.75,
                'flood': 0.60,
                'pivot': 0.85,
                'surface': 0.60 // Fallback
            }
        };
    }

    /**
     * Main Calculation Method
     * @param {Object} inputs { region, season, crop, cropType, area (ha), irrigationType, stage }
     */
    calculate(inputs) {
        console.log("Irrigation Calc Input:", inputs);

        // 1. Determine ETo (Evapotranspiration Reference)
        const region = inputs.region || 'central'; // Default to Riyadh/Central
        const season = inputs.season || 'spring';
        const eto = (this.data.ETO_TABLE[region] || this.data.ETO_TABLE['default'])[season] || 8;

        // 2. Determine Kc (Crop Coefficient)
        let kc = 0.8; // Safe default
        const type = inputs.cropType || 'vegetable';
        const stage = inputs.stage || 'mid'; // Default to peak demand (safest for planning)

        // Match stage to Kc phase (initial, mid, end)
        let phase = 'mid';
        if (['planting', 'seedling', 'establishment'].includes(stage)) phase = 'initial';
        if (['growing', 'vegetative', 'flowering', 'fruiting'].includes(stage)) phase = 'mid';
        if (['harvest', 'maturation', 'ripening'].includes(stage)) phase = 'end';

        // Custom override for Date Palm
        if (inputs.crop === 'date_palm') {
            kc = this.data.KC_DEFAULTS.date_palm[phase];
        } else {
            kc = (this.data.KC_DEFAULTS[type] || this.data.KC_DEFAULTS['vegetable'])[phase];
        }

        // 3. Efficiency
        const sys = inputs.irrigationType || 'drip';
        const eff = this.data.EFFICIENCY[sys] || 0.70;

        // 4. Calculate Gross Requirement
        // ETc = ETo * Kc
        // Gross = ETc / Efficiency
        const etc = eto * kc;
        const grossDepth_mm = etc / eff; // mm/day

        // 5. Volume Calculation
        // 1 mm = 10 m3/ha
        const area_ha = inputs.area || 1;
        const dailyVolume_m3 = grossDepth_mm * 10 * area_ha;

        // 6. Schedule (Duration)
        // If Flow Rate is provided (m3/hr), calculate hours
        let duration = null;
        if (inputs.flowRate && inputs.flowRate > 0) {
            duration = (dailyVolume_m3 / inputs.flowRate).toFixed(1);
        }

        return {
            eto: eto,
            kc: kc,
            efficiency: eff,
            dailymm: grossDepth_mm.toFixed(1),
            dailyVolume: Math.round(dailyVolume_m3), // m3
            dailyLiters: Math.round(dailyVolume_m3 * 1000), // Liters
            duration: duration,
            note: this.getNote(eto, kc, sys),
            warning: this.getWarning(inputs, dailyVolume_m3)
        };
    }

    getNote(eto, kc, sys) {
        if (sys === 'flood') return "تنبيه: الكفاءة منخفضة جداً (60%). يضيع 40% من الماء!";
        if (eto > 10) return "تنبيه: معدل البخر عالي جداً في هذا الموسم/المنطقة.";
        return "النظام يعمل بكفاءة قياسية.";
    }

    getWarning(inputs, vol) {
        if (!inputs.flowRate) return "لم يتم تحديد معدل تدفق المضخة، لا يمكن حساب وقت التشغيل.";
        return null;
    }
}
