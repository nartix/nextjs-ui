import { edgeToken } from '@nartix/edge-token/src';

describe('Token Utility Tests', () => {
  const secret = 'supersecretkey';
  let tokenUtil: any;

  beforeAll(async () => {
    tokenUtil = await edgeToken({ secret });
    console.log('Starting token utility tests...');
  });

  // Test 1: Generate and verify a simple token without data and timing
  test('Test 1: Simple token generation and verification', async () => {
    const token = await tokenUtil.generate();
    const isValid = await tokenUtil.verify(token);
    expect(isValid).toBe(true);
  });

  // Test 2: Generate and verify a token with embedded data
  test('Test 2: Token generation and verification with embedded data', async () => {
    const data = { userId: 123, role: 'admin' };
    const token = await tokenUtil.generateWithData(data);
    const isValid = await tokenUtil.verifyWithData(token, data);
    expect(isValid).toBe(true);
  });

  // Test 3: Generate and verify a timed token without data
  test('Test 3: Timed token generation and verification without data', async () => {
    const token = await tokenUtil.generateTimed();
    const isValid = await tokenUtil.verifyTimed(token, '', 5000); // 5 seconds max age
    expect(isValid).toBe(true);
  });

  // Test 4: Generate and verify a timed token with embedded data
  test('Test 4: Timed token generation and verification with embedded data', async () => {
    const data = 'user-session';
    const token = await tokenUtil.generateWithDataTimed(data);
    const isValid = await tokenUtil.verifyWithDataTimed(token, data, 5000); // 5 seconds max age
    expect(isValid).toBe(true);
  });

  // Test 5: Verify a token with incorrect data
  test('Test 5: Verification with incorrect data should fail', async () => {
    const correctData = { userId: 123, role: 'admin' };
    const incorrectData = { userId: 999, role: 'guest' };
    const token = await tokenUtil.generateWithData(correctData);
    const isValid = await tokenUtil.verifyWithData(token, incorrectData);
    expect(isValid).toBe(false);
  });

  // Test 6: Verify a token after expiration
  test('Test 6: Verification after token expiration should fail', async () => {
    const token = await tokenUtil.generateTimed();
    // Wait for 2 seconds to simulate token aging
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const isValid = await tokenUtil.verifyTimed(token, '', 1000); // 1 second max age
    expect(isValid).toBe(false);
  });

  // Test 7: Verify a token with altered signature
  test('Test 7: Verification with altered signature should fail', async () => {
    const token = await tokenUtil.generate();
    const seperator = tokenUtil.options.seperator;
    const tokenParts = token.split(seperator);
    // Alter the signature part
    tokenParts[tokenParts.length - 1] = 'invalidsignature';
    const alteredToken = tokenParts.join(seperator);
    const isValid = await tokenUtil.verify(alteredToken);
    expect(isValid).toBe(false);
  });

  // Test 8: Verify a token with altered data
  test('Test 8: Verification with altered data should fail', async () => {
    const data = { userId: 123, role: 'admin' };
    const token = await tokenUtil.generateWithData(data);
    const seperator = tokenUtil.options.seperator;
    const tokenParts = token.split(seperator);
    // Assuming the first part is data
    if (tokenParts.length > 0) {
      tokenParts[0] = tokenParts[0].replace(/.$/, 'A'); // Alter the last character
    }
    const alteredToken = tokenParts.join(seperator);
    const isValid = await tokenUtil.verifyWithData(alteredToken, data);
    expect(isValid).toBe(false);
  });

  // Test 9: Generate multiple tokens and ensure uniqueness
  test('Test 9: Multiple token generations should produce unique tokens', async () => {
    const tokensSet = new Set<string>();
    let unique = true;
    for (let i = 0; i < 100; i++) {
      const token = await tokenUtil.generate();
      if (tokensSet.has(token)) {
        unique = false;
        break;
      }
      tokensSet.add(token);
    }
    expect(unique).toBe(true);
  });

  // Test 10: Token generation with SHA-1 algorithm
  test('Test 10: Token generation with SHA-1 algorithm', async () => {
    const tokenUtilSHA1 = await edgeToken({ secret, algorithm: 'SHA-1' });
    const token = await tokenUtilSHA1.generate();
    const isValid = await tokenUtilSHA1.verify(token);
    expect(isValid).toBe(true);
  });

  // Test 11: Token generation with custom seperator
  test('Test 11: Token generation with custom seperator', async () => {
    const customseperator = '|';
    const tokenUtilCustomSep = await edgeToken({ secret, seperator: customseperator });
    const token = await tokenUtilCustomSep.generate();
    const isValid = await tokenUtilCustomSep.verify(token);
    expect(isValid).toBe(true);
    expect(token).toContain(customseperator);
  });

  // Test 12: Token generation with different byte lengths
  test('Test 12: Token generation with different byte lengths', async () => {
    const byteLengths = [16, 64, 128];
    let byteLengthTestPass = true;

    for (const length of byteLengths) {
      const tokenUtilVarLength = await edgeToken({ secret, tokenByteLength: length });
      const token = await tokenUtilVarLength.generate();
      const seperator = tokenUtilVarLength.options.seperator;
      const parts = token.split(seperator || '.');
      const randomBytesBase64 = parts[parts.length - 2];
      if (randomBytesBase64) {
        const randomBytes = Uint8Array.from(Buffer.from(randomBytesBase64, 'base64'), (c) => c);
        if (randomBytes.length !== length) {
          byteLengthTestPass = false;
          break;
        }
      } else {
        byteLengthTestPass = false;
        break;
      }
    }

    expect(byteLengthTestPass).toBe(true);
  });

  // Test 13: Verification with invalid token formats should fail
  test('Test 13: Verification with invalid token formats should fail', async () => {
    const invalidTokens = [
      '.',
      '', // Empty string
      'justonepart',
      'part1.part2', // Missing signature
      'part1.part2.', // Missing signature
      'part1.part2.part3',
      'part1.part2.part3.part4',
      'part1.part2.part3.part4.part5', // Too many parts
    ];
    let invalidFormatPass = true;
    for (const invalidToken of invalidTokens) {
      const isValid = await tokenUtil.verify(invalidToken);
      if (isValid) {
        invalidFormatPass = false;
        break;
      }
    }
    expect(invalidFormatPass).toBe(true);
  });

  // Test 14: Verification with invalid Base64 encoding should fail
  test('Test 14: Verification with invalid Base64 encoding should fail', async () => {
    const token = await tokenUtil.generate();
    const seperator = tokenUtil.options.seperator;
    const tokenParts = token.split(seperator);
    // Introduce invalid Base64 characters in the first part
    tokenParts[0] = '!!!invalidbase64!!!';
    const invalidBase64Token = tokenParts.join(seperator);
    const isValid = await tokenUtil.verify(invalidBase64Token);
    expect(isValid).toBe(false);
  });

  // Test 15: Verification with invalid timestamps should fail
  test('Test 15: Verification with invalid timestamps should fail', async () => {
    const token = await tokenUtil.generateTimed();
    const seperator = tokenUtil.options.seperator;
    const tokenParts = token.split(seperator);
    // Determine the position of the timestamp based on whether data is shown
    // Since generateTimed does not include data, timestamp should be the first part
    tokenParts[0] = 'invalidtimestamp';
    const invalidTimestampToken = tokenParts.join(seperator);
    const isValid = await tokenUtil.verifyTimed(invalidTimestampToken, '', 5000);
    expect(isValid).toBe(false);
  });

  // Test 16: Token generation and verification with custom dataSerializer and dataDecoder
  test('Test 16: Token generation and verification with custom dataSerializer and dataDecoder', async () => {
    const customSerializer = (data: any) => {
      if (typeof data === 'number') {
        return new Uint8Array([data]);
      }
      return new TextEncoder().encode(String(data));
    };
    const customDecoder = (data: Uint8Array) => {
      if (data.length === 1) {
        return data[0];
      }
      return new TextDecoder().decode(data);
    };
    const tokenUtilCustom = await edgeToken({
      secret,
      dataSerializer: customSerializer,
      dataDecoder: customDecoder,
    });
    const data = 42;
    const token = await tokenUtilCustom.generateWithData(data);
    const isValid = await tokenUtilCustom.verifyWithData(token, data);
    expect(isValid).toBe(true);
  });

  test('Test 17: Token generation and verification with empty, null, and undefined data', async () => {
    const edgeCases = [undefined, null, '', 0, false, {}, []];
    let edgeCasePass = true;
    for (const caseData of edgeCases) {
      // console.log('Testing edge case:', caseData);
      const token = await tokenUtil.generateWithData(caseData);
      const isValid = await tokenUtil.verifyWithData(token, caseData);
      // console.log('Token:', token);
      // console.log('Verification:', isValid);
      if (!isValid) {
        edgeCasePass = false;
        break;
      }
    }
    expect(edgeCasePass).toBe(true);
  });

  // Test 18: Verification with mismatched showData flag should fail
  test('Test 18: Verification with mismatched showData flag should fail', async () => {
    const data = { userId: 123, role: 'admin' };
    const token = await tokenUtil.generateWithData(data);
    const isValid = await tokenUtil.verify(token); // Not using verifyWithData
    expect(isValid).toBe(false);
  });

  // Test 19: Verification with mismatched timed flag should fail
  test('Test 19: Verification with mismatched timed flag should fail', async () => {
    const token = await tokenUtil.generateTimed();
    const isValid = await tokenUtil.verify(token); // Not using verifyTimed
    expect(isValid).toBe(false);
  });

  // Test 20: Tokens should use the specified seperator correctly
  test('Test 20: Tokens should use the specified seperator correctly', async () => {
    const seperator = '|';
    const tokenUtilSep = await edgeToken({ secret, seperator: seperator });
    const token = await tokenUtilSep.generateWithData('test');
    const isValid = await tokenUtilSep.verifyWithData(token, 'test');
    expect(isValid).toBe(true);
    expect(token).toContain(seperator);
  });

  afterAll(() => {
    console.log('All tests completed.');
  });
});
