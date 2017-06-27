/**
 * https://github.com/google/eddystone/tree/master/eddystone-url
 */

import { TextEncoder } from 'text-encoding';

type HexTypes = { [code: number]: string };

const URL_SCHEMES: HexTypes = {
  0x00: 'http://www.',
  0x01: 'https://www.',
  0x02: 'http://',
  0x03: 'https://',
};

const URL_CODES: HexTypes = {
  0x00: '.com/',
  0x01: '.org/',
  0x02: '.edu/',
  0x03: '.net/',
  0x04: '.info/',
  0x05: '.biz/',
  0x06: '.gov/',
  0x07: '.com',
  0x08: '.org',
  0x09: '.edu',
  0x0a: '.net',
  0x0b: '.info',
  0x0c: '.biz',
  0x0d: '.gov',
};

function decodeUrl(raw: DataView): string {
  const scheme: string = URL_SCHEMES[raw.getUint8(0)];
  const url = Array.from(Array(raw.byteLength).keys())
    .slice(1)
    .map((bytePos) => {
      const byteVal: number = raw.getUint8(bytePos);
      return URL_CODES[byteVal] || String.fromCharCode(byteVal);
    })
    .join('');
  return `${scheme}${url}`;
}

function encodeUrl(val: string): DataView {
  const encoder = new TextEncoder('utf-8');
  const encoded: number[] = [];
  
  for (let i = 0; i < val.length; i += 1) {
    // Try shorten the result as much as possible by using the above references.
    const shortEncoded = shortEncode(val.slice(i));
    if (shortEncoded) {
      encoded.push(shortEncoded.code);
      i += shortEncoded.jump - 1;
      continue;
    }
    // If it can't be shortened, simply encode the character.
    encoded.push(encoder.encode(val[i])[0]);
  }

  const buffer = new ArrayBuffer(encoded.length);
  const raw = new DataView(buffer);
  encoded.forEach((character, i) => raw.setUint8(i, character));
  return raw;
}

function shortEncode(val: string): { code: number, jump: number } | undefined {
  return shortEncodeWithDict(val, URL_SCHEMES) 
      || shortEncodeWithDict(val, URL_CODES);
}

function shortEncodeWithDict(val: string, hexTypes: HexTypes)
    : { code: number, jump: number } | undefined {
  const matching: string[] = Object.keys(hexTypes).filter((codeIndex: string) => {
    const code = Number(codeIndex);
    return val.startsWith(hexTypes[code]);
  });
  if (matching.length === 0) {
    return undefined;
  }

  matching.sort();
  const bestMatch = Number(matching[0]);
  return {
    code: bestMatch,
    jump: hexTypes[bestMatch].length,
  };
}

export {
  encodeUrl,
  decodeUrl,
};
