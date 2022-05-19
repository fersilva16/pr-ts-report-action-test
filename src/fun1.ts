export type Fun1Options = {
  a: string;
  b: number;
  c: boolean;
};

export const fun1 = (options: Fun1Options): Fun1Options => {
  return options.d;
};
