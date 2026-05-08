/* * */

import { type I18nCode } from '@tmlmobilidade/types';

/**
 * Initial part of the prompt, common to all templates, that sets the context
 * and instructions for the generation of the alert descriptions.
 */
export const initDescriptionPrompt: Record<I18nCode, string> = {
	en: `
		You work for a public transit company, and you are responsible for generating short, clear and precise
		descriptions for Service Alerts, in British English. Please return only the description, without any
		additional text such as titles or formatting, using the provided parameters and the template text
		as a reference for the style of the message.
	`,
	pt: `
		Trabalhas numa empresa de transportes públicos, e estás encarregue de gerar descrições
		curtas, claras e precisas para Alertas de Serviço (Service Alerts), em Português de Portugal.
		Por favor devolve apenas a descrição, sem nenhum texto adicional como títulos ou formatação,
		utilizando os parâmetros fornecidos e o texto-tipo como referência para o estilo da mensagem.
		Adapta todos os textos em função do género e número de referências (singular ou plural, evitando marcas
		de plural facultativas), agrupando-as quando necessário, e utilizando as expressões mais naturais
		para cada caso. É importante que te coloques no lugar dos passageiros que irão ler a descrição,
		que provavelmente estão numa paragem à espera do veículo sem informações atualizadas.
		Deves ter em conta o impacto que o alerta tem nas suas viagens, em função da sua real gravidade,
		evitando palavras que possam causar ansiedade ou preocupação desnecessária, e focando-te em transmitir
		a informação de forma empática e útil para os passageiros.
	`,
};

/**
 * Initial part of the prompt, common to all templates, that sets the context
 * and instructions for the generation of the alert titles.
 */
export const initTitlePrompt: Record<I18nCode, string> = {
	en: '',
	pt: `
		Trabalhas numa empresa de transportes públicos, e estás encarregue de gerar um título curto,
		claro e preciso para um Alerta de Serviço (Service Alert), em Português de Portugal.
		Por favor devolve apenas o título, sem nenhum texto adicional como descrições ou formatação,
		utilizando os parâmetros fornecidos e o exemplo como referência para o estilo da mensagem.
		Adapta todos os textos em função do género e número de referências (singular ou plural, evitando marcas
		de plural facultativas), agrupando-as quando necessário, e utilizando as expressões mais naturais
		para cada caso. É importante que te coloques no lugar dos passageiros que irão ler o título,
		que provavelmente estão numa paragem à espera do veículo sem informações atualizadas.
		Deves ter em conta o impacto que o alerta tem nas suas viagens, em função da sua real gravidade,
		evitando palavras que possam causar ansiedade ou preocupação desnecessária, e focando-te em transmitir
		a informação de forma empática e útil para os passageiros.

		Exemplo 1: "4001 | Serviço interrompido devido a obras"
		Exemplo 2: "4001, 4002 | Atrasos significativos devido a acidente"
		Exemplo 3: "4001 | Desvio de percurso devido a festas populares"
	`,
};
