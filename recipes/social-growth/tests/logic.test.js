import { describe, it, expect } from 'vitest';

// Simple heuristic logic to test (mirrored from src/agent-main.js)
const generateInsightHeuristic = (item) => {
  const isHealthcare = /medic|health|doctor|patient|surger|clinic|biol/i.test(item.title + item.summary);
  const isCoding = /code|programm|dev|engineer|software|python|javascript/i.test(item.title + item.summary);
  
  let hook = isHealthcare ? "🏥 Healthcare AI Watch:" : (isCoding ? "👨‍💻 Dev Perspective:" : "🤖 AI Update:");
  let tags = isHealthcare ? "#AI #HealthTech" : (isCoding ? "#AI #Dev" : "#AI #Tech");
  
  return `${hook} ${item.title}\n\nMy take: [Your expert take here]\n\n🔗 ${item.link} ${tags}`;
};

describe('Social Growth Logic', () => {
  it('identifies healthcare topics correctly', () => {
    const item = { title: 'New medical AI breakthrough', summary: 'clinic research', link: 'http://test.com' };
    const draft = generateInsightHeuristic(item);
    expect(draft).toContain('🏥 Healthcare AI Watch:');
    expect(draft).toContain('#AI #HealthTech');
  });

  it('identifies coding topics correctly', () => {
    const item = { title: 'JavaScript performance tips', summary: 'software engineering', link: 'http://test.com' };
    const draft = generateInsightHeuristic(item);
    expect(draft).toContain('👨‍💻 Dev Perspective:');
    expect(draft).toContain('#AI #Dev');
  });

  it('includes the mandatory placeholder for human insight', () => {
    const item = { title: 'Generic AI News', summary: 'something happened', link: 'http://test.com' };
    const draft = generateInsightHeuristic(item);
    expect(draft).toContain('[Your expert take here]');
  });
});
