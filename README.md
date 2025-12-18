# Pipeline de dados
A pipeline de dados é construída como uma ETL.

## Instalação
Para executar a pipeline é importante garantir que as dependências estejam instaladas nas versões corretas. 
As dependências usadas pela aplicação são as descritas aqui. Como a instalação varia de acordo com distribuição fica listada quais são e qual versão é requisitada, além do link oficial de instalação para cada uma.

- [nodejs](https://nodejs.org/en) (na versão >= 24.0);
- [eccodes](https://confluence.ecmwf.int/display/ECC/ecCodes+installation) (versão >= 2.44.0);
- [gdal](https://gdal.org/en/stable/download.html) (versão >=3.10.3);

Para começar instalar a pipeline, clone o repositório e execute:
```sh
git clone https://github.com/gustavo-aesanto/draf-map-tiles.git
cd draf-map-tiles/data
pnpm install
```

## Execução
Para executar o download dos dados e gerar as imagens use:
```
# garanta que você tem permissão de execução
chmod +x ./data/modules/wind/download.sh

# execute a pipeline
./data/modules/wind/download.sh
```
As imagens e arquivos estarão no diretório `frontend/tiles` e `frontend/data`, respectivamente.
