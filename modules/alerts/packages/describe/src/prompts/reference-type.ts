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
			Quando o tipo da referência é "agency", toda a rede do operador foi afetada.
			Isto significa que o alerta é especialmente importante, pois irá impactar
			um grande número de passageiros. A descrição gerada deve mencionar explicitamente
			que todos os serviços poderão estar impactados, e deves ter especial cuidado nas palavras
			pois as causas são normalmente situações fora do controlo do operador ou temas sensíveis.
		`,
	},
	lines: {
		en: '',
		pt: `
			Este alerta está a afetar todos os serviços das linhas selecionadas. Nem sempre é uma situação
			negativa (como em situações de aumento de serviço). Deves mencionar o número e nome da linha,
			assim como o período em que o alerta estará ativo, tendo em conta o bom senso das horas
			(por exemplo manhã/noite; se for durante todo o dia ou vários dias completos talvez não valha
			a pena referir horas, pois a informação pode não ser relevante para os passageiros).

			Exemplo de uma descrição:
			Devido a {CAUSA; obras, acidente, atualização de rede, etc.}, a(s) linha(s) {LINE_SHORT_NAME}
			{LINE_LONG_NAME} está(ão) a {EFEITO; ser verficados atrasos, têm o seu percurso desviado, etc.}
			durante {DURAÇÃO; o período da manhã de 1 de Abril, etc.}. Lamentamos o incómodo e agradecemos
			a sua compreensão.
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
			os horários afetados. O objetivo é sempre dar a maiorquantidade de informação possível numa frase
			curta e fácil de ler.

			Exemplo de uma descrição:
			Devido a {CAUSA}, verificam-se {EFEITO} nas viagens das {HH}:{MM}, {HH}:{MM} e {HH}:{MM}
			da linha {LINE_SHORT_NAME} com destino a {DESTINO} e viagem das {HH}:{MM} da linha {LINE_SHORT_NAME}
			com destino a {DESTINO}. As viagens não foram canceladas e deverão realizar-se assim que o problema
			seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.
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

			Exemplo de uma descrição:
			Entre as {HH}:{MM} e as {HH}:{MM} do dia {DATE}, {EFEITO; haverá corte de trânsito, desvio de percurso, etc.}
			na {STOP_NAME}, no {MUNICÍPIO}, devido a {EFEITO; devido a obras, trabalhos na via, etc.}. Deste modo, as linhas
			{LINE_SHORT_NAME}, {LINE_SHORT_NAME} e {LINE_SHORT_NAME} não servirão esta paragem. Lamentamos o incómodo
			e agradecemos a sua compreensão.
		`,
	},
};
