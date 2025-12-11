export type Field = {
  key: string;
  value: number | string | Array<number>;
};

type InputData = {
  messages: Array<Array<Field>>;
};

export function transformEntriesToObject<T>(data: Array<Field>): T {
  return data.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.key]: curr.value,
    }),
    {}
  ) as T;
}
