/* * */

import { type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Reference type specific instructions to be included in the prompt
 * for the generation of the alert descriptions.
 */
export const referenceTypePrompt: Record<AlertReferenceType, Record<I18nCode, string>> = {

	agency: {
		en: '',
		pt: `
			Este alerta afeta a rede do operador.
			Utiliza o nome do operador indicado de seguida e constrói algo como:
			 "Devido a {CAUSA},... os serviços do {OPERADOR} podem estar {EFEITO}."
		`,
	},

	lines: {
		en: '',
		pt: `
			Este alerta afeta linhas selecionadas. Nem sempre é uma situação negativa
			(como em situações de aumento de serviço).

			Se o contexto NÃO indicar paragens específicas para uma linha, podes assumir
			que o impacto é geral nessa linha e descrever a linha como um todo.

			Se o contexto indicar paragens específicas dessa linha (por exemplo através
			de uma lista "Only on the following stops"), então o alerta é parcial e
			deves representar explicitamente essa restrição na descrição. Nesses casos,
			não deves descrever a linha inteira como afetada; deves dizer que o impacto
			se aplica apenas nessas paragens / nesse troço / nessa zona.
			Quando o efeito for desvio de percurso e o contexto indicar paragens específicas,
			assume por defeito que a linha faz desvio e que essas paragens deixam de ser servidas
			durante o desvio, a menos que o contexto diga outra coisa.

			Deves mencionar o número e nome da linha, e, quando o contexto restringir o
			impacto a paragens concretas, essa restrição tem de aparecer na descrição.
			Se existirem linhas identificadas, a descrição tem de mencionar explicitamente essas linhas;
			não substituas essa informação por uma formulação genérica sobre o serviço do operador.
			O período do alerta pode ser adaptado com bom senso (por exemplo manhã/noite;
			se for durante todo o dia ou vários dias completos talvez não valha a pena
			referir horas).

			Exemplo natural para DETOUR com paragens específicas:
			Devido a {CAUSA}, a linha {LINE_SHORT_NAME} {LINE_LONG_NAME} fará desvio de percurso,
			pelo que as paragens {STOP_NAME}, {STOP_NAME} e {STOP_NAME} não serão servidas.
			Se as instruções do utilizador trouxerem percurso alternativo, novas paragens servidas
			ou pontos de referência relevantes, usa essa informação apenas como complemento.
			Mantém primeiro a linha afetada e as paragens não servidas; depois acrescenta, se fizer sentido,
			algo como "o desvio passará pelo {PONTO_DE_REFERÊNCIA}" ou "passará a servir a paragem {STOP_NAME}".
		`,
	},

	rides: {
		en: '',
		pt: `
			Este alerta está a afetar viagens específicas. A causa é fundamental para que o passageiro entenda
			o porquê da situação que está a ocorrer. Em casos onde a causa é indefinida (como problemas ténicos) mantém
			a descrição genérica. Deves mencionar o número da linha e o destino da viagem, e no caso de serem
			várias viagens da mesma linha com o mesmo destino, deves agrupá-las numa única frase, mencionando
			os horários afetados. O objetivo é sempre dar a maior quantidade de informação útil
			possível numa frase curta e fácil de ler.

			Exemplo de uma descrição (atrasos):
			Devido a {CAUSA}, verificam-se atrasos significativos na viagem das {HH}:{MM} da linha {LINE_SHORT_NAME}
			com destino a {DESTINO}.
		`,
	},

	stops: {
		en: '',
		pt: `
			Este alerta afeta uma paragem específica. Apesar de afetar as linhas que
			por ali passam, a descrição deve incidirs sobre o impacto da situação na paragem.
			Mantém primeiro a paragem afetada e as linhas não servidas; depois acrescenta, se fizer sentido,
			algo como "o desvio passará pelo {PONTO_DE_REFERÊNCIA}" ou "passará a servir a paragem {STOP_NAME}".
		`,
	},

};
