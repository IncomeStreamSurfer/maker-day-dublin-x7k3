// Simple human-readable ticket codes: MDD-ABCD-1234
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O to avoid ambiguity
const DIGITS = '23456789';

function pick(str: string, n: number) {
  let out = '';
  for (let i = 0; i < n; i++) out += str[Math.floor(Math.random() * str.length)];
  return out;
}

export function generateTicketCode() {
  return `MDD-${pick(ALPHABET, 4)}-${pick(DIGITS, 4)}`;
}
