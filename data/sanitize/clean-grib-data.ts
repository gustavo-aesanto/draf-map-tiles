type Field = {
  key: string;
  value: number | string | Array<number>;
};

type InputData = {
  messages: Array<Array<Field>>;
};

export function transformGRIBSetToObject<T>(data: InputData): T {
  return data.messages[0].reduce((acc, curr) => { 
    acc[curr.key] = curr.value;
    return acc;
  }, {}) as T;
}

