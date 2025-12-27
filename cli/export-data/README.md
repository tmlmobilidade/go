### @tmlmobilidade/export-data

Este script assume que os ficheiros GTFS dos operadores vêm no formato pedido pela TML; i.e. cumprem os requisitos indicados nesta página: https://docs.google.com/spreadsheets/d/1RUa5FYvKcpcu6bEdG4DFV2OQAhsngWB1dqTY9vSgIQo/edit?gid=2058239706#gid=2058239706

Para utilizar o script é necessário ter o NodeJS/NPM instalado. Seguir os passos aqui: https://nodejs.org/en/download

#### Para obter instruções de utilização do script:

`npx @tmlmobilidade/export-data --help`

#### Para correr o script para um ficheiro GTFS da Fertagus, por exemplo:

```
npx @tmlmobilidade/export-data \
	--file=Fertagus_GTFS.zip \
	--start-date=20250625 \
	--end-date=20250625 \
	--feed-id=123
```

#### Explicação dos parâmetros:
- `--file` é o caminho para o ficheiro .zip a ser processado
- `--start-date` é a primeira data a incluir nos ficheiros gerados, mesmo que o GTFS contenha oferta antes.
- `--end-date` é a última data a incluir nos ficheiros gerados, mesmo que o GTFS contenha oferta depois.
- `--feed-id` campo opcional a incluir nos ficheiros finais para mais fácil identificação depois da integração.

#### Opções adicionais:
- `--output-dir` caminho do diretório onde serão gerados os ficheiros finais. Defaults to ‘./output’
- `--override` ao incluir este parâmetro o diretório de output-dir será substituído com a nova geração.