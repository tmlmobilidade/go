/* * */

import { type I18nCode } from '@tmlmobilidade/types';

/**
 * Branding and title-structure rules for multi-operator alerts (CM areas 41–44 have specific labels).
 */
export const brandingPrompt: Record<I18nCode, string> = {
	en: '',
	pt: `
		Operador (plataforma multi-operador):
		- Quando o contexto incluir "Passenger-facing operator label", esse é o nome mostrado
		ao passageiro para esse alerta.
		- Usa "Title operator label" apenas nos títulos de rede (agency), quando esse campo existir;
		é uma versão mais curta do nome do operador pensada para o título.
		- Se o rótulo indicar Carris Metropolitana (áreas 41–44), NÃO substituas pelo nome legal
		do operador (ex.: Viação Alvorada).
		- Para outros operadores, usa o rótulo fornecido; não assumes Carris Metropolitana.
		- Só menciona a app ou site Carris Metropolitana quando o rótulo do operador for da CM;
		caso contrário evita referências à CM ou usa formulários genéricos (horários em tempo real).
		- Em alertas com linhas, viagens, circulações ou paragens identificadas, não abras o título
		nem a descrição com a marca do operador; privilegia primeiro as linhas/circulações/paragens
		afetadas e a informação prática para o passageiro.
	`,
};
