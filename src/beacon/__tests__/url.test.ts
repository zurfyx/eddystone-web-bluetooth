import { decodeUrl, encodeUrl } from '../url';

const URL1 = 'https://example.com';
const URL2 = 'https://www.npmjs.com/features';

it('should decode the same value it has encoded', () => {
  const result1 = decodeUrl(encodeUrl(URL1));
  expect(result1).toBe(URL1);

  const result2 = decodeUrl(encodeUrl(URL2));
  expect(result2).toBe(URL2);
});

it('the encoded value should be as short as possible (by using prefixed codes)', () => {
  const result1 = encodeUrl(URL1);
  expect(result1.byteLength).toBe(9);

  const result2 = encodeUrl(URL2);
  expect(result2.byteLength).toBe(15);
});
