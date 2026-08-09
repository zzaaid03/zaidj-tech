import { describe, expect, it } from 'vitest';
import { adjustForIssue, generateRecipe, type BrewInput } from './logic';

function input(overrides: Partial<BrewInput> = {}): BrewInput {
  return {
    method: 'V60',
    origin: '',
    process: 'washed',
    roastLevel: 'medium',
    tasteGoal: 'balanced',
    experience: 'amateur',
    ...overrides,
  };
}

describe('generateRecipe - process affects temperature only', () => {
  it('changes water temperature but never changes ratio', () => {
    const washed = generateRecipe(input({ process: 'washed' }));
    const anaerobic = generateRecipe(input({ process: 'anaerobic' }));

    expect(washed.ratio).toBe(anaerobic.ratio);
    expect(washed.waterTempC).not.toBe(anaerobic.waterTempC);
  });
});

describe('generateRecipe - known cases', () => {
  it('V60 / light / washed / balanced / amateur', () => {
    const recipe = generateRecipe(
      input({ method: 'V60', roastLevel: 'light', process: 'washed', tasteGoal: 'balanced', experience: 'amateur' }),
    );
    expect(recipe.waterTempC).toBe(96);
    expect(recipe.grind).toBe('fine');
  });

  it('Chemex / dark / anaerobic / bold / expert', () => {
    const recipe = generateRecipe(
      input({ method: 'Chemex', roastLevel: 'dark', process: 'anaerobic', tasteGoal: 'bold', experience: 'expert' }),
    );
    expect(recipe.waterTempC).toBe(92);
    expect(recipe.grind).toBe('coarse');
  });

  it('Kalita Wave / medium / natural / sweet / beginner', () => {
    const recipe = generateRecipe(
      input({ method: 'Kalita Wave', roastLevel: 'medium', process: 'natural', tasteGoal: 'sweet', experience: 'beginner' }),
    );
    expect(recipe.waterTempC).toBe(95);
    expect(recipe.grind).toBe('medium');
  });
});

describe('generateRecipe - temperature clamp', () => {
  it('stays within 88 to 97 at the coldest extreme', () => {
    const recipe = generateRecipe(
      input({ method: 'Chemex', roastLevel: 'dark', process: 'anaerobic', tasteGoal: 'bright', experience: 'expert' }),
    );
    expect(recipe.waterTempC).toBeGreaterThanOrEqual(88);
    expect(recipe.waterTempC).toBeLessThanOrEqual(97);
  });

  it('stays within 88 to 97 at the hottest extreme', () => {
    const recipe = generateRecipe(
      input({ method: 'Chemex', roastLevel: 'light', process: 'washed', tasteGoal: 'bold', experience: 'beginner' }),
    );
    expect(recipe.waterTempC).toBeGreaterThanOrEqual(88);
    expect(recipe.waterTempC).toBeLessThanOrEqual(97);
  });
});

describe('generateRecipe - pour steps sum to total water', () => {
  it('V60', () => {
    const recipe = generateRecipe(input({ method: 'V60' }));
    const sum = recipe.pours.reduce((total, step) => total + step.waterGrams, 0);
    expect(sum).toBe(recipe.totalWaterGrams);
  });

  it('Kalita Wave', () => {
    const recipe = generateRecipe(input({ method: 'Kalita Wave' }));
    const sum = recipe.pours.reduce((total, step) => total + step.waterGrams, 0);
    expect(sum).toBe(recipe.totalWaterGrams);
  });

  it('Chemex', () => {
    const recipe = generateRecipe(input({ method: 'Chemex' }));
    const sum = recipe.pours.reduce((total, step) => total + step.waterGrams, 0);
    expect(sum).toBe(recipe.totalWaterGrams);
  });
});

describe('adjustForIssue', () => {
  it('sour moves grind only', () => {
    const before = generateRecipe(input());
    const result = adjustForIssue(input(), 'sour');
    const after = generateRecipe(result.input);

    expect(result.changed).toBe(true);
    expect(after.grind).not.toBe(before.grind);
    expect(after.ratio).toBe(before.ratio);
    expect(after.waterTempC).toBe(before.waterTempC);
  });

  it('bitter moves grind only', () => {
    const before = generateRecipe(input());
    const result = adjustForIssue(input(), 'bitter');
    const after = generateRecipe(result.input);

    expect(result.changed).toBe(true);
    expect(after.grind).not.toBe(before.grind);
    expect(after.ratio).toBe(before.ratio);
    expect(after.waterTempC).toBe(before.waterTempC);
  });

  it('weak moves ratio only', () => {
    const before = generateRecipe(input());
    const result = adjustForIssue(input(), 'weak');
    const after = generateRecipe(result.input);

    expect(result.changed).toBe(true);
    expect(after.ratio).not.toBe(before.ratio);
    expect(after.grind).toBe(before.grind);
    expect(after.waterTempC).toBe(before.waterTempC);
  });

  it('dry moves water temperature only', () => {
    const before = generateRecipe(input());
    const result = adjustForIssue(input(), 'dry');
    const after = generateRecipe(result.input);

    expect(result.changed).toBe(true);
    expect(after.waterTempC).not.toBe(before.waterTempC);
    expect(after.ratio).toBe(before.ratio);
    expect(after.grind).toBe(before.grind);
  });

  it('chains weak against the ratio floor, every changed step actually moves the ratio', () => {
    let current = input({ roastLevel: 'dark', tasteGoal: 'bold' });
    let previousRatio = generateRecipe(current).ratio;

    for (let i = 0; i < 6; i++) {
      const result = adjustForIssue(current, 'weak');
      const nextRatio = generateRecipe(result.input).ratio;

      if (result.changed) {
        expect(nextRatio).not.toBe(previousRatio);
      } else {
        expect(nextRatio).toBe(previousRatio);
      }

      current = result.input;
      previousRatio = nextRatio;
    }
  });

  it('chains dry against the temperature floor, every changed step actually moves the temp', () => {
    let current = input({
      process: 'anaerobic',
      roastLevel: 'light',
      tasteGoal: 'bright',
      experience: 'expert',
    });
    let previousTemp = generateRecipe(current).waterTempC;

    for (let i = 0; i < 6; i++) {
      const result = adjustForIssue(current, 'dry');
      const nextTemp = generateRecipe(result.input).waterTempC;

      if (result.changed) {
        expect(nextTemp).not.toBe(previousTemp);
      } else {
        expect(nextTemp).toBe(previousTemp);
      }

      current = result.input;
      previousTemp = nextTemp;
    }
  });

  it('light roast on V60 is already at the finest grind, so sour reports no change', () => {
    const result = adjustForIssue(input({ method: 'V60', roastLevel: 'light' }), 'sour');
    expect(result.changed).toBe(false);
  });
});
