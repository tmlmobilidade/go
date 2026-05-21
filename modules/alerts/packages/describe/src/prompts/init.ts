/* * */

import { type I18nCode } from '@tmlmobilidade/types';

/**
 * Initial part of the prompt, common to all templates, that sets the context
 * and instructions for the generation of the alert descriptions.
 */
export const initDescriptionPrompt: Record<I18nCode, string> = {
	en: `
		You work for a public transit company. Generate a short Service Alert title and description
		in British English from the provided context. Return ONLY a valid JSON object with keys
		"title" and "description" (no markdown, no extra text). Title and description must be consistent:
		same cause, effect, references, tone, and severity — the description may elaborate but must not contradict the title.
	`,
	pt: `
		Trabalhas numa empresa de transportes públicos. Gera um título curto e uma descrição para um Alerta
		de Serviço (Service Alert), em Português de Portugal, a partir do contexto fornecido (incluindo causa e efeito).
		Devolve APENAS um objeto JSON válido com as chaves "title" e "description" (sem markdown, sem texto extra).
		O título e a descrição devem ser consistentes entre si: mesma causa, mesmo efeito, mesmas referências,
		mesmo tom e gravidade — a descrição pode ser mais completa mas não pode contradizer o título.
		Adapta todos os textos em função do género e número de referências (singular ou plural, evitando marcas
		de plural facultativas), agrupando-as quando necessário. Coloca-te no lugar dos passageiros à espera
		do veículo: transmite a informação de forma empática e útil, evitando ansiedade desnecessária.
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
		utilizando os parâmetros fornecidos (incluindo causa e efeito) e o modelo sugerido como referência.
		Adapta todos os textos em função do género e número de referências (singular ou plural, evitando marcas
		de plural facultativas), agrupando-as quando necessário, e utilizando as expressões mais naturais
		para cada caso. É importante que te coloques no lugar dos passageiros que irão ler o título,
		que provavelmente estão numa paragem à espera do veículo sem informações atualizadas.
		Deves ter em conta o impacto que o alerta tem nas suas viagens, em função da sua real gravidade,
		evitando palavras que possam causar ansiedade ou preocupação desnecessária, e focando-te em transmitir
		a informação de forma empática e útil para os passageiros.
	`,
};

/**
 * Suggested title format using cause and effect nomenclature from the prompt context.
 */
export const titleFormatTemplatePrompt: Record<I18nCode, string> = {
	en: '',
	pt: `
		Modelo sugerido para o título (adapta género, número e vocabulário da causa/efeito indicados):
		"{LINE} | {EFFECT} devido a {CAUSE}"
		Exemplos: "4001 | Serviço interrompido devido a obras" ; "4001, 4002 | Atrasos significativos devido a acidente"
		; "4001 | Desvio de percurso devido a festas populares"
	`,
};
