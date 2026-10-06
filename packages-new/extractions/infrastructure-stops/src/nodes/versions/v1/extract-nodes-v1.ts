/* * */

// Importar o acesso aos dados, as permissões, os tipos e schemas da extração,
// a ferramenta de escrita CSV e toOutputRows de ./transform.js.

// Implementar extractInfrastructureNodesV1(context, extraction).

// 1. Validar os parâmetros da extração e aplicar as permissões do utilizador.

// 2. Consultar as paragens e as associações necessárias, respeitando os filtros.
// Selecionar as flags e os seus agency_ids de acordo com os filtros e permissões.
// Consultar os operadores referenciados em goDb.core.agencies e construir
// agencyCodesById com agency._id como chave e agency.code como valor.
// Resolver os identificadores do nó, o modo e a validade antes da transformação.
// Avaliar line.transport_type através dos percursos que servem a paragem para obter o modo.
// A regra para vários modos e a fonte do agrupamento e da validade ainda precisam de confirmação.

// 3. Preparar node.txt em context.output_path e configurar o cabeçalho CSV
// nesta ordem: operator_id, operator_stop_id, stop_name, lat, lon, quay_id,
// stop_place_id, mode, valid_from, valid_to.

// 4. Chamar toOutputRows(input, agencyCodesById) para cada paragem com as flags selecionadas.
// Escrever as linhas resultantes.
// Delegar o tratamento de delimitadores, aspas e quebras de linha ao writer CSV.

// 5. Finalizar a escrita com flush antes de concluir a extração.
// O worker existente trata da compressão e da disponibilização do resultado.
