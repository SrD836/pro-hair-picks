import { describe, it, expect } from 'vitest';
import {
  calculateScores,
  getRiskLevel,
  QUESTIONS,
  getProductRecommendations,
} from './diagnosticoCapilarEngine';

describe('QUESTIONS', () => {
  it('has 12 questions', () => expect(QUESTIONS).toHaveLength(12));
  it('has 4 modules numbered 1-4', () => {
    const modules = [...new Set(QUESTIONS.map(q => q.module))].sort();
    expect(modules).toEqual([1, 2, 3, 4]);
  });
  it('every option has non-negative points', () => {
    QUESTIONS.forEach(q =>
      q.options.forEach(o => expect(o.points).toBeGreaterThanOrEqual(0))
    );
  });
});

describe('calculateScores', () => {
  it('returns zero scores for all-A answers', () => {
    const allA: Record<string, string> = {};
    QUESTIONS.forEach(q => { allA[q.id] = 'A'; });
    const s = calculateScores(allA);
    expect(s.total).toBe(0);
    expect(s.cuticle).toBe(0);
    expect(s.porosity).toBe(0);
    expect(s.elasticity).toBe(0);
    expect(s.scalp).toBe(0);
  });

  it('total equals sum of module scores', () => {
    const allA: Record<string, string> = {};
    QUESTIONS.forEach(q => { allA[q.id] = 'A'; });
    const s = calculateScores(allA);
    expect(s.total).toBe(s.cuticle + s.porosity + s.elasticity + s.scalp);
  });

  it('partial answers skip unanswered questions (treat as 0)', () => {
    const s = calculateScores({});
    expect(s.total).toBe(0);
  });
});

describe('getRiskLevel', () => {
  it('0-15 → optimal', () => expect(getRiskLevel(0)).toBe('optimal'));
  it('15 → optimal', () => expect(getRiskLevel(15)).toBe('optimal'));
  it('16 → caution', () => expect(getRiskLevel(16)).toBe('caution'));
  it('35 → caution', () => expect(getRiskLevel(35)).toBe('caution'));
  it('36 → critical', () => expect(getRiskLevel(36)).toBe('critical'));
  it('67 → critical', () => expect(getRiskLevel(67)).toBe('critical'));
});

describe('getProductRecommendations', () => {
  it('returns exactly 3 products for each level', () => {
    expect(getProductRecommendations('optimal')).toHaveLength(3);
    expect(getProductRecommendations('caution')).toHaveLength(3);
    expect(getProductRecommendations('critical')).toHaveLength(3);
  });
  it('each product has asin, name, description', () => {
    getProductRecommendations('caution').forEach(p => {
      expect(p.asin).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
    });
  });
});


