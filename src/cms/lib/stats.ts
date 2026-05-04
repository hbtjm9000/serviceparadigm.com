/**
 * Statistical analysis utilities for experiment results
 * Uses frequentist hypothesis testing to determine significance
 */

interface ExperimentResults {
  variantKey: string;
  exposures: number;
  conversions: number;
}

interface StatisticalResult {
  variantKey: string;
  conversionRate: number;
  confidenceInterval: [number, number];
  pValue?: number;
  isSignificant?: boolean;
  relativeImprovement?: number;
}

/**
 * Calculate conversion rate with Wilson score confidence interval
 */
export function calculateConversionRate(
  exposures: number,
  conversions: number,
  confidenceLevel: number = 0.95
): { rate: number; ci: [number, number] } {
  if (exposures === 0) {
    return { rate: 0, ci: [0, 0] };
  }

  const rate = conversions / exposures;
  
  // Wilson score interval
  const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
  const denominator = 1 + z * z / exposures;
  const centre = (rate + z * z / (2 * exposures)) / denominator;
  const margin = (z / denominator) * Math.sqrt((rate * (1 - rate)) / exposures + z * z / (4 * exposures * exposures));

  return {
    rate,
    ci: [Math.max(0, centre - margin), Math.min(1, centre + margin)],
  };
}

/**
 * Calculate p-value using two-proportion z-test
 * Compares variant against control (baseline)
 */
export function calculatePValue(
  controlExposures: number,
  controlConversions: number,
  variantExposures: number,
  variantConversions: number
): number {
  if (controlExposures === 0 || variantExposures === 0) {
    return 1;
  }

  const p1 = controlConversions / controlExposures;
  const p2 = variantConversions / variantExposures;
  const pPool = (controlConversions + variantConversions) / (controlExposures + variantExposures);

  if (pPool === 0 || pPool === 1) {
    return 1;
  }

  const se = Math.sqrt(pPool * (1 - pPool) * (1 / controlExposures + 1 / variantExposures));
  
  if (se === 0) {
    return 1;
  }

  const z = (p2 - p1) / se;
  
  // Two-tailed p-value
  return 2 * (1 - normalCDF(Math.abs(z)));
}

/**
 * Standard normal cumulative distribution function
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return x > 0 ? 1 - prob : prob;
}

/**
 * Analyze experiment results and return statistical summary
 */
export function analyzeExperiment(
  results: ExperimentResults[],
  controlKey: string = 'v1-baseline'
): StatisticalResult[] {
  const control = results.find(r => r.variantKey === controlKey);
  
  if (!control) {
    throw new Error(`Control variant '${controlKey}' not found`);
  }

  return results.map(variant => {
    const { rate, ci } = calculateConversionRate(variant.exposures, variant.conversions);
    
    let pValue: number | undefined;
    let isSignificant: boolean | undefined;
    let relativeImprovement: number | undefined;

    if (variant.variantKey !== controlKey) {
      pValue = calculatePValue(
        control.exposures,
        control.conversions,
        variant.exposures,
        variant.conversions
      );
      
      isSignificant = pValue < 0.05;
      
      const controlRate = control.conversions / control.exposures;
      relativeImprovement = controlRate > 0 ? ((rate - controlRate) / controlRate) * 100 : 0;
    }

    return {
      variantKey: variant.variantKey,
      conversionRate: rate,
      confidenceInterval: ci,
      pValue,
      isSignificant,
      relativeImprovement,
    };
  });
}

/**
 * Determine the winning variant based on statistical significance
 */
export function findWinner(
  results: StatisticalResult[],
  confidenceThreshold: number = 0.05
): { winner: string | null; confidence: number } {
  const baseline = results.find(r => !r.pValue); // Control has no p-value
  
  if (!baseline) {
    return { winner: null, confidence: 0 };
  }

  const significantVariants = results.filter(
    r => r.pValue !== undefined && r.pValue! < confidenceThreshold && r.conversionRate > baseline.conversionRate
  );

  if (significantVariants.length === 0) {
    return { winner: null, confidence: 0 };
  }

  // Return the variant with the lowest p-value (most significant)
  const winner = significantVariants.reduce((best, current) => 
    (current.pValue! < best.pValue!) ? current : best
  );

  return {
    winner: winner.variantKey,
    confidence: 1 - winner.pValue!,
  };
}
