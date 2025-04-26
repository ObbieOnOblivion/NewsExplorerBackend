function safeStringify(obj, options = {}) {
  const {
    space = 2,
    maxDepth = 20,
    redactProto = true,
    handleErrors = true
  } = options;

  const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype", "$set"]);
  const seen = new WeakSet();
  const context = {
    currentDepth: 0,
    maxDepth
  };

  function serializer(key, value, currentDepth = 0) {
    // Depth limit check
    if (currentDepth > maxDepth) {
      return "[Max Depth Exceeded]";
    }

    // Prototype pollution protection
    if (redactProto && key && BLOCKED_KEYS.has(key)) {
      return "[PROTOTYPE BLOCKED]";
    }

    // Circular reference detection
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular Reference]";
      }
      seen.add(value);
    }

    // Special handling for Error objects
    if (value instanceof Error) {
      return {
        __error__: true,
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    // Binary data handling
    if (value instanceof Buffer || value?.[Symbol.asyncIterator]) {
      return "[Binary Data]";
    }
    
  if (typeof value === "object" && value !== null) {
    context.currentDepth++;
    
    if (context.currentDepth > context.maxDepth) {
      context.currentDepth--;
      return "[Max Depth Exceeded]";
    }
  }

    return value;
  }


  try {
    // Initialize depth tracking
    const initialReplacer = (key, value) => serializer(key, value, 0);
    return JSON.stringify(obj, initialReplacer, space);
  } catch (err) {
    if (!handleErrors) throw err;
    return JSON.stringify({
      __stringifyError__: true,
      message: err.message,
      type: typeof obj
    });
  }
}

export { safeStringify };
