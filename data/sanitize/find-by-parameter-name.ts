type Variable = {
  value: any;
  key: string;
}

export function findByParameterName(data: Array<Array<Variable>>, parameterName: string) {
  return data.find((messages) =>
    messages.some(
      ({ value }) => value.toString().trim() === parameterName.trim()
    )
  );
}
