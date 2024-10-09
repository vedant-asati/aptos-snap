export function bytesToHex(bytes): string {
  return `0x${[...bytes]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as string;
}

export function hexToBytes(hex) {
  const strippedHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = [];
  for (let i = 0; i < strippedHex.length; i += 2) {
    bytes.push(parseInt(strippedHex.substr(i, 2), 16));
  }
  return Uint8Array.from(bytes);
}

/**
 *
 * @param segment
 */
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

export function assertInput(path) {
  if (!path) {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertAllStrings(input) {
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

export function assertIsArray(input) {
  if (!Array.isArray(input)) {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertIsString(input) {
  if (typeof input !== 'string') {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertIsBoolean(input) {
  if (typeof input !== 'boolean') {
    throw {
      code: -32000,
      message: 'Invalid input.',
    };
  }
}

export function assertConfirmation(confirmed) {
  if (!confirmed) {
    throw {
      code: 4001,
      message: 'User rejected the request.',
    };
  }
}
