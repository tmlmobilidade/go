/* * */

import { type AlertReferenceType, type I18nCode } from '@tmlmobilidade/types';

/**
 * Reference type specific instructions to be included in the prompt
 * for the generation of the alert descriptions.
 */
export const referenceTypePrompt: Record<AlertReferenceType, Record<I18nCode, string>> = {
	agency: {
		en: '',
		pt: `
			Quando o tipo da referência é "agency", toda a rede da área foi afetada.
			Usa o rótulo do operador indicado no contexto (rede do operador afetada).
			Nunca o nome legal do operador quando o rótulo já traz o nome voltado ao passageiro.
			A descrição deve indicar que todos os serviços da rede podem estar impactados.
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

			Exemplo de descrição parcial:
			Devido a {CAUSA}, o impacto na linha {LINE_SHORT_NAME} {LINE_LONG_NAME}
			aplica-se apenas na zona das paragens {STOP_NAME}, {STOP_NAME} e {STOP_NAME}.
			Indica depois, com linguagem natural, se essas paragens ficam sem serviço,
			se existe desvio de percurso nesse troço, ou qual é exatamente o impacto.

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
			Este alerta está a afetar viagens específicas, por exemplo a viagem das 9h ou das 10h
			num determinado sentido/destino. A causa é fundamental para que o passageiro entenda o porquê
			da situação que está a ocorrer. Em casos onde a causa é indefinida (como problemas ténicos) mantém
			a descrição genérica. Deves mencionar o número da linha e o destino da viagem, e no caso de serem
			várias viagens da mesma linha com o mesmo destino, deves agrupá-las numa única frase, mencionando
			os horários afetados. O objetivo é sempre dar a maior quantidade de informação útil
			possível numa frase curta e fácil de ler.

			Se o contexto indicar paragens específicas para uma viagem (por exemplo através
			de uma lista "Only on the following stops for this ride"), então o alerta é parcial
			nessa circulação e essa restrição tem de aparecer na descrição.
			Quando o efeito for desvio de percurso e o contexto indicar paragens específicas,
			assume por defeito que a viagem fará desvio e que essas paragens não serão servidas
			durante o desvio, a menos que o contexto diga outra coisa.

			Exemplo de uma descrição (atrasos):
			Devido a {CAUSA}, verificam-se atrasos significativos nas viagens das {HH}:{MM} da linha {LINE_SHORT_NAME}
			com destino a {DESTINO}.

			Exemplo natural para DETOUR com paragens específicas:
			Devido a {CAUSA}, a viagem das {HH}:{MM} da linha {LINE_SHORT_NAME} com destino a {DESTINO}
			fará desvio de percurso, pelo que as paragens {STOP_NAME}, {STOP_NAME} e {STOP_NAME}
			não serão servidas.
		`,
	},
	stops: {
		en: '',
		pt: `
			Este alerta deve olhar sobre o prisma da paragem, ou seja, apesar de afetar as linhas que
			por ali passam, a descrição deve incidir sobre o impacto da situação na paragem.
			Nem todas as linhas serão afetadas. Nem sempre é uma situação negativa (como em situações
			de aumento de serviço). Se houver espaço, menciona o nome e código da paragem, e o número
			e nome das linhas afetadas, assim como o período em que o alerta estará ativo, tendo em conta
			o bom senso das horas (por exemplo manhã/noite; se for durante todo o dia ou vários dias completos
			talvez não valha a pena referir horas, pois a informação pode não ser relevante para os passageiros).
			Privilegia formulações naturais do ponto de vista da paragem, como
			"esta paragem não será servida" ou "as linhas X e Y não servirão esta paragem",
			em vez de construções artificiais.
			No título, se houver linhas identificadas, menciona primeiro a linha ou lista de linhas
			e só depois a paragem (ex.: "{LINHAS} | {PARAGEM}: {EFEITO}").

			Exemplo de uma descrição:
			Entre as {HH}:{MM} e as {HH}:{MM} do dia {DATE}, {EFEITO; haverá corte de trânsito, desvio de percurso, etc.}
			na {STOP_NAME}, no {MUNICÍPIO}, devido a {EFEITO; devido a obras, trabalhos na via, etc.}. Deste modo, as linhas
			{LINE_SHORT_NAME}, {LINE_SHORT_NAME} e {LINE_SHORT_NAME} não servirão esta paragem. Lamentamos o incómodo
			e agradecemos a sua compreensão.
		`,
	},
};
