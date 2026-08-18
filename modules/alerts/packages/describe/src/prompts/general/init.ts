/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Initial part of the prompt for generating title and description together.
 */
export const initDescriptionPrompt: Record<I18nCode, string> = {
	en: `
		You generate short Service Alert titles and descriptions for a public transport platform
		used by multiple operators (bus, metro, etc.). Use the operator label provided in the context.
		Write in British English. Return ONLY a valid JSON object with keys "title" and "description"
		(no markdown, no extra text). Title and description must be consistent.
	`,
	pt: `
		Geras títulos e descrições curtos para Alertas de Serviço numa plataforma de transportes
		utilizada por vários operadores (autocarros, metro, etc.). Usa os rótulos e detalhes
		fornecidos no contexto.
		Escreve em Português de Portugal. Devolve APENAS um objeto JSON válido com as chaves "title" e "description"
		(sem markdown, sem texto extra). Título e descrição consistentes: mesma causa, efeito, referências e gravidade.
		O efeito fornecido é autoritativo e obrigatório: não o substituas por outro.
		Qualquer detalhe do contexto que restrinja o âmbito do alerta deve estar refletido no resultado final:
		paragens específicas, linhas específicas, viagens específicas, destinos, troços afetados, operador e local.
		Não ignores um detalhe mais específico para escrever uma versão genérica do alerta.
		Não inventes detalhes de localização se eles não estiverem explicitamente no contexto.
		Privilegia sempre formulações naturais em Português de Portugal. Não combines mecanicamente
		o nome da referência com o rótulo do efeito nem copies modelos de frase de forma literal.
		Se uma construção soar artificial, reescreve-a com bom senso mantendo o mesmo significado.
		A descrição deve terminar sempre com uma frase final breve, empática e útil para o passageiro.
		Esse fecho deve reconhecer o impacto do alerta, mas ajustar o tom à causa para não atribuir
		culpa indevida ao operador quando a situação é externa ao seu controlo.
		A única exceção é a formulação exata de datas e horas, que pode ser adaptada com bom senso
		para soar natural e útil ao passageiro.
		A causa na descrição ("Devido a …"); no título sobretudo o efeito em forma nominal.
		Adapta género e número (singular/plural). Tom empático e útil, sem alarmismo desnecessário.
	`,
};
