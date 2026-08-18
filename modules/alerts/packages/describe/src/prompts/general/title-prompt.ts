/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Title structure examples (see brandingPrompt for full rules).
 */
export const titleFormatTemplatePrompt: Record<I18nCode, string> = {
	en: '',
	pt: `
		Título: curto, claro, específico e em forma nominal.
		Não uses "devido a {causa}" no título.
		Usa estas estruturas como guia de concisão e clareza, não como molde rígido:
		- Um único âmbito antes do efeito: "{LINHA ou LISTA}: {Efeito em poucas palavras}", "{PARAGEM}: {Efeito}" ou "{Title operator label}: {Efeito}".
		- Vários âmbitos antes do efeito: usa "|" apenas para separar esses âmbitos, e ":" apenas uma vez antes do efeito final.
		- Exemplos corretos: "1001: Desvio de percurso", "1206, 1236: Viagens canceladas", "1719 | Colégio Militar (Metro) P6: Paragem não servida".
		- Rede (agency): "{Title operator label ou rótulo curto do operador}: {Efeito}".
		Se uma formulação equivalente soar mais natural e continuar curta, clara e específica, prefere a formulação natural.
		Se houver linhas/circulações identificadas, elas têm prioridade no título; não uses área ou operador.
		LOCAL só deve aparecer quando estiver explicitamente no contexto e for uma localização útil para o passageiro.
		"Área N" não é LOCAL para títulos de linhas, viagens ou paragens.
		LINHAS = códigos curtos separados por vírgulas e "e" antes do último.
		Para rides, o título deve mencionar as linhas/circulações afetadas.
		Se houver vários âmbitos antes do efeito, ordena-os do mais geral para o mais específico.
		Se houver linhas e paragens no mesmo título, escreve primeiro a linha ou lista de linhas e depois a paragem.
	`,
};
