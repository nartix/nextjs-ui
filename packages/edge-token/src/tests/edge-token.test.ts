// tokenUtil.test.ts

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
    const separator = tokenUtil.options.seperator;
    const tokenParts = token.split(separator);
    // Alter the signature part
    tokenParts[tokenParts.length - 1] = 'invalidsignature';
    const alteredToken = tokenParts.join(separator);
    const isValid = await tokenUtil.verify(alteredToken);
    expect(isValid).toBe(false);
  });

  // Test 8: Verify a token with altered data
  test('Test 8: Verification with altered data should fail', async () => {
    const data = { userId: 123, role: 'admin' };
    const token = await tokenUtil.generateWithData(data);
    const separator = tokenUtil.options.seperator;
    const tokenParts = token.split(separator);
    // Assuming the first part is data
    if (tokenParts.length > 0) {
      tokenParts[0] = tokenParts[0].replace(/.$/, 'A'); // Alter the last character
    }
    const alteredToken = tokenParts.join(separator);
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

  // Test 11: Token generation with custom separator
  test('Test 11: Token generation with custom separator', async () => {
    const customSeparator = '|';
    const tokenUtilCustomSep = await edgeToken({ secret, seperator: customSeparator });
    const token = await tokenUtilCustomSep.generate();
    const isValid = await tokenUtilCustomSep.verify(token);
    expect(isValid).toBe(true);
    expect(token).toContain(customSeparator);
  });

  // Test 12: Token generation with different byte lengths
  test('Test 12: Token generation with different byte lengths', async () => {
    const byteLengths = [16, 64, 128];
    let byteLengthTestPass = true;

    for (const length of byteLengths) {
      const tokenUtilVarLength = await edgeToken({ secret, tokenByteLength: length });
      const token = await tokenUtilVarLength.generate();
      const separator = tokenUtilVarLength.options.seperator;
      const parts = token.split(separator);
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
    const separator = tokenUtil.options.seperator;
    const tokenParts = token.split(separator);
    // Introduce invalid Base64 characters in the first part
    tokenParts[0] = '!!!invalidbase64!!!';
    const invalidBase64Token = tokenParts.join(separator);
    const isValid = await tokenUtil.verify(invalidBase64Token);
    expect(isValid).toBe(false);
  });

  // Test 15: Verification with invalid timestamps should fail
  test('Test 15: Verification with invalid timestamps should fail', async () => {
    const token = await tokenUtil.generateTimed();
    const separator = tokenUtil.options.seperator;
    const tokenParts = token.split(separator);
    // Determine the position of the timestamp based on whether data is shown
    // Since generateTimed does not include data, timestamp should be the first part
    tokenParts[0] = 'invalidtimestamp';
    const invalidTimestampToken = tokenParts.join(separator);
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

  // Test 17: Token generation and verification with empty, null, and undefined data
  test('Test 17: Token generation and verification with empty, null, and undefined data', async () => {
    const edgeCases = [undefined, null, '', 0, false, {}, []];
    let edgeCasePass = true;
    for (const caseData of edgeCases) {
      const token = await tokenUtil.generateWithData(caseData);
      const isValid = await tokenUtil.verifyWithData(token, caseData);
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

  // Test 20: Tokens should use the specified separator correctly
  test('Test 20: Tokens should use the specified separator correctly', async () => {
    const separator = '|';
    const tokenUtilSep = await edgeToken({ secret, seperator: separator });
    const token = await tokenUtilSep.generateWithData('test');
    const isValid = await tokenUtilSep.verifyWithData(token, 'test');
    expect(isValid).toBe(true);
    expect(token).toContain(separator);
  });

  afterAll(() => {
    console.log('All tests completed.');
  });
});

// import { edgeToken } from '@nartix/edge-token';

// async function runTests() {
//   console.log('Starting token utility tests...');

//   const secret = 'supersecretkey';
//   const tokenUtil = await edgeToken({ secret });

//   // Helper function to log test results
//   const logResult = (testName: string, condition: boolean) => {
//     console.assert(condition, `❌ ${testName} failed`);
//     if (condition) {
//       console.log(`✅ ${testName} passed`);
//     }
//   };

//   // Test 1: Generate and verify a simple token without data and timing
//   const test1Name = 'Test 1: Simple token generation and verification';
//   const token1 = await tokenUtil.generate();
//   const isValid1 = await tokenUtil.verify(token1);
//   logResult(test1Name, isValid1);

//   // Test 2: Generate and verify a token with embedded data
//   const test2Name = 'Test 2: Token generation and verification with embedded data';
//   const data2 = { userId: 123, role: 'admin' };
//   const token2 = await tokenUtil.generateWithData(data2);
//   const isValid2 = await tokenUtil.verifyWithData(token2, data2);
//   logResult(test2Name, isValid2);

//   // Test 3: Generate and verify a timed token without data
//   const test3Name = 'Test 3: Timed token generation and verification without data';
//   const token3 = await tokenUtil.generateTimed();
//   const isValid3 = await tokenUtil.verifyTimed(token3, '', 5000); // 5 seconds max age
//   logResult(test3Name, isValid3);

//   // Test 4: Generate and verify a timed token with embedded data
//   const test4Name = 'Test 4: Timed token generation and verification with embedded data';
//   const data4 = 'user-session';
//   const token4 = await tokenUtil.generateWithDataTimed(data4);
//   const isValid4 = await tokenUtil.verifyWithDataTimed(token4, data4, 5000); // 5 seconds max age
//   logResult(test4Name, isValid4);

//   // Test 5: Verify a token with incorrect data
//   const test5Name = 'Test 5: Verification with incorrect data should fail';
//   const incorrectData5 = { userId: 999, role: 'guest' };
//   const isValid5 = await tokenUtil.verifyWithData(token2, incorrectData5);
//   logResult(test5Name, !isValid5);

//   // Test 6: Verify a token after expiration
//   const test6Name = 'Test 6: Verification after token expiration should fail';
//   const token6 = await tokenUtil.generateTimed();
//   // Wait for 2 seconds to simulate token aging
//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   const isValid6 = await tokenUtil.verifyTimed(token6, '', 1000); // 1 second max age
//   logResult(test6Name, !isValid6);

//   // Test 7: Verify a token with altered signature
//   const test7Name = 'Test 7: Verification with altered signature should fail';
//   const tokenParts7 = token1.split(tokenUtil.options.seperator);
//   // Alter the signature part
//   tokenParts7[tokenParts7.length - 1] = 'invalidsignature';
//   const alteredToken7 = tokenParts7.join(tokenUtil.options.seperator);
//   const isValid7 = await tokenUtil.verify(alteredToken7);
//   logResult(test7Name, !isValid7);

//   // Test 8: Verify a token with altered data
//   const test8Name = 'Test 8: Verification with altered data should fail';
//   const tokenParts8 = token2.split(tokenUtil.options.seperator);
//   // Assuming the first part is data
//   tokenParts8[0] = tokenParts8[0]!.replace(/.$/, 'A'); // Alter the last character
//   const alteredToken8 = tokenParts8.join(tokenUtil.options.seperator);
//   const isValid8 = await tokenUtil.verifyWithData(alteredToken8, data2);
//   logResult(test8Name, !isValid8);

//   // Test 9: Generate multiple tokens and ensure uniqueness
//   const test9Name = 'Test 9: Multiple token generations should produce unique tokens';
//   const tokensSet = new Set<string>();
//   let unique = true;
//   for (let i = 0; i < 100; i++) {
//     const token = await tokenUtil.generate();
//     if (tokensSet.has(token)) {
//       unique = false;
//       break;
//     }
//     tokensSet.add(token);
//   }
//   logResult(test9Name, unique);

//   // Test 10: Test different algorithms (SHA-1)
//   const test10Name = 'Test 10: Token generation with SHA-1 algorithm';
//   const tokenUtilSHA1 = await edgeToken({ secret, algorithm: 'SHA-1' });
//   const token10 = await tokenUtilSHA1.generate();
//   const isValid10 = await tokenUtilSHA1.verify(token10);
//   logResult(test10Name, isValid10);

//   // Test 11: Test different separators
//   const test11Name = 'Test 11: Token generation with custom separator';
//   const customSeparator = '|';
//   const tokenUtilCustomSep = await edgeToken({ secret, seperator: customSeparator });
//   const token11 = await tokenUtilCustomSep.generate();
//   const isValid11 = await tokenUtilCustomSep.verify(token11);
//   logResult(test11Name, isValid11 && token11.includes(customSeparator));

//   // Test 12: Test different tokenByteLength
//   const test12Name = 'Test 12: Token generation with different byte lengths';
//   const byteLengths = [16, 64, 128];
//   let byteLengthTestPass = true;
//   for (const length of byteLengths) {
//     const tokenUtilVarLength = await edgeToken({ secret, tokenByteLength: length });
//     const token = await tokenUtilVarLength.generate();
//     const parts = token.split(tokenUtilVarLength.options.seperator);
//     const randomBytesBase64 = parts[parts.length - 2];
//     if (randomBytesBase64) {
//       const randomBytes = Uint8Array.from(atob(randomBytesBase64), (c) => c.charCodeAt(0));
//       if (randomBytes.length !== length) {
//         byteLengthTestPass = false;
//         break;
//       }
//     } else {
//       byteLengthTestPass = false;
//       break;
//     }
//   }
//   logResult(test12Name, byteLengthTestPass);

//   // Test 13: Verify invalid token formats
//   const test13Name = 'Test 13: Verification with invalid token formats should fail';
//   const invalidTokens = [
//     '.',
//     '', // Empty string
//     'justonepart',
//     'part1.part2', // Missing signature
//     'part1.part2.', // Missing signature
//     'part1.part2.part3',
//     'part1.part2.part3.part4',
//     'part1.part2.part3.part4.part5', // Too many parts
//   ];
//   let invalidFormatPass = true;
//   for (const invalidToken of invalidTokens) {
//     const isValid = await tokenUtil.verify(invalidToken);
//     if (isValid) {
//       invalidFormatPass = false;
//       break;
//     }
//   }
//   logResult(test13Name, invalidFormatPass);

//   // Test 14: Verify tokens with invalid Base64
//   const test14Name = 'Test 14: Verification with invalid Base64 encoding should fail';
//   const tokenParts14 = token1.split(tokenUtil.options.seperator);
//   // Introduce invalid Base64 characters
//   tokenParts14[0] = '!!!invalidbase64!!!';
//   const invalidBase64Token14 = tokenParts14.join(tokenUtil.options.seperator);
//   const isValid14 = await tokenUtil.verify(invalidBase64Token14);
//   logResult(test14Name, !isValid14);

//   // Test 15: Verify tokens with invalid timestamps
//   const test15Name = 'Test 15: Verification with invalid timestamps should fail';
//   const token15 = await tokenUtil.generateTimed();
//   const tokenParts15 = token15.split(tokenUtil.options.seperator);
//   // Determine the position of the timestamp based on whether data is shown
//   // Since generateTimed does not include data, timestamp should be the first part
//   tokenParts15[0] = 'invalidtimestamp';
//   const invalidTimestampToken15 = tokenParts15.join(tokenUtil.options.seperator);
//   const isValid15 = await tokenUtil.verifyTimed(invalidTimestampToken15, '', 5000);
//   logResult(test15Name, !isValid15);

//   // Test 16: Test with custom dataSerializer and dataDecoder
//   const test16Name = 'Test 16: Token generation and verification with custom dataSerializer and dataDecoder';
//   const customSerializer = (data: any) => {
//     if (typeof data === 'number') {
//       return new Uint8Array([data]);
//     }
//     return new TextEncoder().encode(String(data));
//   };
//   const customDecoder = (data: Uint8Array) => {
//     if (data.length === 1) {
//       return data[0];
//     }
//     return new TextDecoder().decode(data);
//   };
//   const tokenUtilCustom = await edgeToken({
//     secret,
//     dataSerializer: customSerializer,
//     dataDecoder: customDecoder,
//   });
//   const data16 = 42;
//   const token16 = await tokenUtilCustom.generateWithData(data16);
//   const isValid16 = await tokenUtilCustom.verifyWithData(token16, data16);
//   logResult(test16Name, isValid16);

//   // Test 17: Edge cases with empty, null, and undefined data
//   let test17Name = 'Test 17: Token generation and verification with empty, null, and undefined data';
//   const edgeCases = [undefined, null, '', 0, false, {}, []];
//   let edgeCasePass = true;
//   for (const caseData of edgeCases) {
//     const token = await tokenUtil.generateWithData(caseData);
//     const isValid = await tokenUtil.verifyWithData(token, caseData);
//     if (!isValid) {
//       edgeCasePass = false;
//       break;
//     }
//   }
//   logResult(test17Name, edgeCasePass);

//   // Test 18: Verify a token with mismatched showData flag
//   const test18Name = 'Test 18: Verification with mismatched showData flag should fail';
//   const token18 = await tokenUtil.generateWithData(data2);
//   const isValid18 = await tokenUtil.verify(token18); // Not using verifyWithData
//   logResult(test18Name, !isValid18);

//   // Test 19: Verify a token with mismatched timed flag
//   const test19Name = 'Test 19: Verification with mismatched timed flag should fail';
//   const token19 = await tokenUtil.generateTimed();
//   const isValid19 = await tokenUtil.verify(token19); // Not using verifyTimed
//   logResult(test19Name, !isValid19);

//   // Test 20: Ensure tokens are correctly separated by the specified separator
//   const test20Name = 'Test 20: Tokens should use the specified separator correctly';
//   const separator = '|';
//   const tokenUtilSep = await edgeToken({ secret, seperator: separator });
//   const token20 = await tokenUtilSep.generateWithData('test');
//   logResult(test20Name, token20.includes(separator));

//   console.log('All tests completed.');
// }

// runTests().catch((err) => {
//   console.error('An error occurred during testing:', err);
// });
