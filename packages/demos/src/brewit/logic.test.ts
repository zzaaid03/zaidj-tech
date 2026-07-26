import { describe, expect, it } from 'vitest';
import { generateRecipe, type BrewInput } from './logic';

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
