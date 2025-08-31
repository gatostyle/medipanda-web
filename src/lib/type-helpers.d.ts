interface ObjectConstructor {
  keys<T extends object>(o: T): (keyof T)[];
  values<T extends object>(o: T): T[keyof T][];
  entries<T extends object>(o: T): [keyof T, T[keyof T]][];
}

type StringKeysOnly<T> = {
  [K in keyof T]: T[K] extends string | undefined ? K : never;
}[keyof T];
