function safeStringify(obj, space = 2, depth = 0, maxDepth = 20, seen = new WeakSet()) {
    // Handle primitive values immediately
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj, null, space);
    }
  
    // Depth limit protection
    if (depth > maxDepth) {
      return JSON.stringify('[Max Depth Exceeded]', null, space);
    }
  
    // Handle circular references
    if (seen.has(obj)) {
      return JSON.stringify('[Circular Reference]', null, space);
    }
    seen.add(obj);
  
    const replacer = (key, value) => {
      // Skip prototype pollution vectors
      if (key === '__proto__' || key === 'constructor') {
        return '[PROTOTYPE BLOCKED]';
      }
  
      // Handle binary data
      if (value instanceof Buffer || value?.[Symbol.asyncIterator]) {
        return '[Binary Data]';
      }
  
      // Structured error handling
      if (value instanceof Error) {
        return {
          __error__: true,
          name: value.name,
          message: value.message,
          stack: value.stack
        };
      }
  
      // Recursive handling for nested objects
      if (typeof value === 'object' && value !== null) {
        return JSON.parse(safeStringify(value, space, depth + 1, maxDepth, seen));
      }
  
      return value;
    };
  
    try {
      // Special handling for Arrays to preserve structure
      if (Array.isArray(obj)) {
        return `[${obj.map(item => 
          JSON.parse(safeStringify(item, space, depth + 1, maxDepth, seen))
        ).join(', ')}]`;
      }
  
      return JSON.stringify(obj, replacer, space);
    } catch (err) {
      return JSON.stringify({
        __stringifyError__: true,
        message: err.message,
        type: Object.prototype.toString.call(obj)
      }, null, space);
    }
  }
  
  module.exports = { safeStringify };