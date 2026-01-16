export type Field = {
  key:
    | "dataDate"
    | "numberOfValues"
    | "maximum"
    | "minimum"
    | "name"
    | "values"
    | "Ni"
    | "Nj"
    | "parameterUnits"
    | "cfVarName"
    | "parameterName";
  value: number | string | Array<number>;
};

export class Clean {
  private transformEntriesToObject<T>(data: Array<Field>): T {
    return data.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.key]: curr.value,
      }),
      {}
    ) as T;
  }

  public formatScalar(data: Array<Field>) {
    const objectData =
      this.transformEntriesToObject<Record<Field["key"], Field["value"]>>(data);

    const formattedData = {
      header: {
        dataDate: objectData.dataDate,
        numberOfValues: objectData.numberOfValues,
        maximum: objectData.maximum,
        minimum: objectData.minimum,
        name: objectData.name,
        ni: objectData.Ni,
        nj: objectData.Nj,
        units: objectData.parameterUnits,
      },
      values: objectData.values,
    };

    return formattedData;
  }

  public formatVector(components: Array<Array<Field>>) {
    const firstComponent = components[0];
    const secondComponent = components[1];

    const objectDataOfFirstComponent =
      this.transformEntriesToObject<Record<Field["key"], Field["value"]>>(
        firstComponent
      );
    const objectDataOfSecondComponent =
      this.transformEntriesToObject<Record<Field["key"], Field["value"]>>(
        secondComponent
      );

    const formattedData = {
      header: {
        dataDate: objectDataOfFirstComponent.dataDate,
        numberOfValues:
          objectDataOfFirstComponent.numberOfValues ||
          objectDataOfSecondComponent.numberOfValues,
        maximum:
          objectDataOfFirstComponent.maximum >
          objectDataOfSecondComponent.maximum
            ? objectDataOfFirstComponent.maximum
            : objectDataOfSecondComponent.maximum,
        minimum:
          objectDataOfFirstComponent.minimum <
          objectDataOfSecondComponent.minimum
            ? objectDataOfFirstComponent.minimum
            : objectDataOfSecondComponent.minimum,
        name: `${objectDataOfFirstComponent.name} and ${objectDataOfSecondComponent.name}`,
        ni: objectDataOfFirstComponent.Ni || objectDataOfSecondComponent.Ni,
        nj: objectDataOfFirstComponent.Nj || objectDataOfSecondComponent.Nj,
        units:
          objectDataOfFirstComponent.parameterUnits ||
          objectDataOfSecondComponent.parameterUnits,
      },
      values: {
        [`${objectDataOfFirstComponent.parameterName[0]}`]:
          objectDataOfFirstComponent.values,
        [`${objectDataOfSecondComponent.parameterName[0]}`]:
          objectDataOfSecondComponent.values,
      },
    };

    return formattedData;
  }

  public titleFormat() {}
}
