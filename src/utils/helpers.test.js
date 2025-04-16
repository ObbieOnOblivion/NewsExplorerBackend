const { safeStringify } = require('./helpers');

describe('safeStringify', () => {
  test('handles circular references', () => {
    const obj = { a: 1 };
    obj.self = obj;
    expect(safeStringify(obj)).toMatchInlineSnapshot(
      `"{\\"a\\":1,\\"self\\":\\"[Circular Reference]\\"}"`
    );
  });

  test('redacts prototype keys', () => {
    const malicious = { __proto__: { isAdmin: true }};
    expect(safeStringify(malicious)).toContain('"[PROTOTYPE BLOCKED]"');
  });

  test('handles nested attacks', () => {
    const payload = {
      user: { 
        $set: { role: 'admin' },
        constructor: { prototype: {} }
      }
    };
    const result = safeStringify(payload);
    expect(result).toContain('"$set":"[PROTOTYPE BLOCKED]"');
    expect(result).toContain('"constructor":"[PROTOTYPE BLOCKED]"');
  });

  test('respects depth limit', () => {
    const deepObj = { a: { b: { c: { d: {} } } } };
    expect(safeStringify(deepObj, 2, 0, 3)).toContain('[Max Depth Exceeded]');
  });
});