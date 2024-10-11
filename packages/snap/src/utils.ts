import type { Account, RawTransaction } from '@aptos-labs/ts-sdk';

export function bytesToHex(bytes: Uint8Array<ArrayBuffer>): string {
  return `0x${[...bytes]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as string;
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const strippedHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = [];
  for (let i = 0; i < strippedHex.length; i += 2) {
    bytes.push(parseInt(strippedHex.substr(i, 2), 16));
  }
  return Uint8Array.from(bytes);
}

export function stringifyBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString(); // Convert BigInt to string
  } else if (Array.isArray(obj)) {
    return obj.map(stringifyBigInts); // Recursively convert BigInt in arrays
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, stringifyBigInts(value)]),
    ); // Recursively convert BigInt in objects
  }
  return obj; // Return other types as-is
}

export function convertBytesToHexRecursively(
  obj: any[] | RawTransaction | null,
): string | any | any[] {
  if (Array.isArray(obj)) {
    return obj.map(convertBytesToHexRecursively);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Check if 'data' field exists and convert it to hex
        if (
          obj[key] &&
          typeof obj[key] === 'object' &&
          obj[key].data !== undefined
        ) {
          newObj[key] = bytesToHex(Object.values(obj[key].data));
        } else if (key === 'args' && Array.isArray(obj[key])) {
          // Special case for 'args' array that contains objects with 'data'
          newObj[key] = obj[key].map((item) => {
            if (item.data !== undefined) {
              return bytesToHex(Object.values(item.data));
            }
            return item;
          });
        } else {
          // Recurse through nested objects/arrays
          newObj[key] = convertBytesToHexRecursively(obj[key]);
        }
      }
    }
    return newObj;
  }
  return obj;
}

export async function fetchData(
  url: RequestInfo | URL,
  options: RequestInit | undefined,
) {
  return await fetch(url, options);
}

export function isValidSegment(segment: string) {
  if (typeof segment !== 'string') {
    return false;
  }

  if (!segment.match(/^[0-9]+'$/u)) {
    return false;
  }

  const index = segment.slice(0, -1);

  if (parseInt(index).toString() !== index) {
    return false;
  }

  return true;
}

export function assertInput(path: string[]) {
  if (!path) {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertAllStrings(input: string[]) {
  if (
    !Array.isArray(input) ||
    !input.every((item) => typeof item === 'string')
  ) {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertIsArray(input: string[]) {
  if (!Array.isArray(input)) {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertIsString(input: string) {
  if (typeof input !== 'string') {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertIsBoolean(input: boolean) {
  if (typeof input !== 'boolean') {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertConfirmation(confirmed: boolean) {
  if (!confirmed) {
    throw {
      code: 4001,
      message: 'User rejected the request.',
    };
  }
}
