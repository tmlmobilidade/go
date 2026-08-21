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
			Este alerta afeta toda a rede do operador.
			Tenta construir um título natural com a seguinte fórmula:
			"{OPERADOR}: {EFEITO} devido a {CAUSA}."
		`,
	},

	lines: {
		en: '',
		pt: `
			Este alerta afeta uma ou mais linhas específicas:
			Nem sempre é uma situação negativa (como em situações de aumento de serviço).

			- identifica a linha de forma clara;
			- utiliza uma formulação adequada ao efeito;
			- não acrescentes informação sobre viagens específicas se estas não forem fornecidas.

			Para cancelamento ou não realização do serviço, privilegia:
			- "Serviço suspenso"
			- "O serviço da linha ... encontra-se suspenso"
			- "Não se realizam viagens na linha ..."
		`,
	},

	rides: {
		en: '',
		pt: `
			Este alerta afeta uma ou mais viagens específicas:
			- menciona o número da linha;
			- menciona o destino da viagem;
			- menciona o horário afetado quando disponível;
			- se várias viagens da mesma linha tiverem o mesmo destino e partilharem o mesmo contexto, agrupa-as numa única construção;
			- não agrupes viagens de forma que torne ambígua a correspondência entre linha, horário e destino;
			- quando linhas ou destinos forem diferentes, mantém clara a associação entre cada linha e o respetivo destino.

			Exemplo de um título para o efeito atrasos:
			{LINE_SHORT_NAME(S)}: atrasos devido a {CAUSA}.

			Exemplo de uma descrição para o efeito atrasos:
			Devido a {CAUSA}, verificam-se atrasos significativos na viagem das {HH}:{MM} da linha {LINE_SHORT_NAME}
			com destino a {DESTINO}.

			Para cancelamento ou não realização:
			- "Viagem cancelada"
			- "A viagem ... não se realiza"
			- "As viagens ... não se realizam"
			- "Não se realizam as viagens ..."
		`,
	},

	stops: {
		en: '',
		pt: `
			Este alerta afeta uma ou mais paragens específicas:
			- identifica as paragens afetadas;
			- utiliza uma formulação adequada ao efeito;
			- evita repetir desnecessariamente a localização.

			Para paragens não servidas:
			- "Paragem não servida"
			- "Esta paragem não será servida"
			- "As paragens ... não serão servidas"
		`,
	},

};
