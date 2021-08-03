type Types = {
  string: string;
  number: number;
  boolean: boolean;
};

export function getEnvVar<
  K extends keyof typeof process.env,
  T extends keyof Types
>(key: K, expectedType: T, defaultValue?: Types[T]): Types[T] {
  const val = process.env[key];

  if (typeof val === 'undefined') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment Variable "${key}" not defined`);
  }

  let outVal: Types[T] = val as Types[T];
  switch (expectedType) {
    case 'number':
      outVal = Number(val) as Types[T];
      if (Number.isNaN(outVal)) {
        throw new Error(`Environment Variable "${key}" is not a number`);
      }
      break;

    case 'boolean':
      outVal = (val.toUpperCase() === 'TRUE') as Types[T];
      break;
  }

  const actualType = typeof outVal;
  if (actualType !== expectedType) {
    throw new Error(
      `Environment Variable "${key}" is of type "${actualType}" but should be of type "${expectedType}"`
    );
  }

  return outVal;
}
