import { hello } from '../hello';

describe('Hello', () => {
  test('returns name param with !', () => {
    expect(hello('🍭')).toBe('Hello 🍭!');
  });

  test('returns name param with .', () => {
    expect(hello('🍭', false)).toBe('Hello 🍭.');
  });
});
