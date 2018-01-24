const crc_table = calc_crc_table();

// $/worlds/introllevel/!intro_master/cooked/!intro_master.mwld
// 0x158EFE17

function calc_crc_table(): Int32Array {
  const tab = new Int32Array(256);
  const POLYNOMIAL = 0xedb88320;
  // Code pulled from the RFC
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = POLYNOMIAL ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    tab[n] = c;
  }

  return tab;
}

export function calcCRC32(inp: string): number {
  const str = inp.toLowerCase();
  // Mostly from the wikipedia  article, tbh
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    const b = str.charCodeAt(i);
    const lookup = (crc ^ b) & 0xFF;
    crc = (crc >>> 8) ^ crc_table[lookup];
  }
  // Prime doesn't do this
  // crc = crc ^ 0xFFFFFFFF;
  return crc;
}


export function hex(num: number): string {
  const HEX_CHARS = '0123456789ABCDEF';
  let res = '';
  for (let i = 7; i >= 0; i--) {
    const char = ((num >> (i * 4)) & 0xF);
    res += HEX_CHARS[char];
  }
  return res;
}
