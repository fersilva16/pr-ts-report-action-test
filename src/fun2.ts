export type Fun2Options = {
  a: string;
  b: number;
  c: boolean;
};

export const fun2 = (options: Fun2Options): Fun2Options => {
  if (options.a === true) return options;
  if (options.a === false) return options;

  return {
    a: '',
  };
};
