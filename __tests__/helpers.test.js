import { safeStringify } from '../src/utils/helpers';

describe('safeStringify Utility', () => {

  describe('Security Features', () => {
    it('should detect and handle circular references', () => {
      const obj = { a: 1 };
      obj.self = obj;
      expect(safeStringify(obj)).toContain('"self": "[Circular Reference]"');
    });

    it('should redact prototype pollution attempts', () => {
      const malicious = { ["__proto__"]: { isAdmin: true } };
      expect(safeStringify(malicious)).toContain('"__proto__": "[PROTOTYPE BLOCKED]"');
    });

    it('should block dangerous MongoDB operations', () => {
      const payload = {
        user: {
          $set: { role: 'admin' },
          constructor: { prototype: {} },
        },
      };
      const result = safeStringify(payload);
      expect(result).toContain('"constructor": "[PROTOTYPE BLOCKED]"');
      expect(result).toContain('"$set": "[PROTOTYPE BLOCKED]"');
    });
  });

  describe('Core Functionality', () => {
    it('should enforce depth limits when specified', () => {
      const deepObj = { a: { b: { c: { d: {} } } }};
      const result = safeStringify(deepObj, { 
        space: 2,
        maxDepth: 2
      });
      expect(result).toContain('[Max Depth Exceeded]');
    });

    it('should serialize normal objects correctly', () => {
      const normalObj = { valid: { data: true } };
      expect(JSON.parse(safeStringify(normalObj))).toEqual(normalObj);
    });
  });
});