/* * */

import { type Ride } from '@tmlmobilidade/types';

/* * */

type RideAnalysisLabels = Record<keyof Ride['analysis'], {
	description: string
	title: string
}>;

/* * */

export const rideAnalysisLabels: RideAnalysisLabels = {
	AT_LEAST_ONE_EVENT_ON_FIRST_STOP: {
		description: 'Uma circulação deve ter pelo menos um evento na primeira paragem.',
		title: 'Pelo menos um evento na primeira paragem',
	},
	AT_MOST_TWO_DRIVER_IDS: {
		description: 'Uma circulação pode ter no máximo dois IDs de motorista diferentes.',
		title: 'No máximo dois motoristas',
	},
	AT_MOST_TWO_VEHICLE_IDS: {
		description: 'Uma circulação pode ter no máximo dois IDs de veículo diferentes.',
		title: 'No máximo dois veículos',
	},
	AVG_INTERVAL_VEHICLE_EVENTS: {
		description: 'O intervalo médio entre eventos não deve exceder os 20 segundos.',
		title: 'Intervalo médio entre eventos',
	},
	ENDED_AT_LAST_STOP: {
		description: 'Uma circulação deve terminar na última paragem.',
		title: 'Terminou na última paragem',
	},
	EXCESSIVE_VEHICLE_EVENT_DELAY: {
		description: 'Os eventos não devem ser entregues com mais de 10 segundos após a sua geração.',
		title: 'Atraso excessivo na entrega dos eventos',
	},
	LESS_THAN_TEN_VEHICLE_EVENTS: {
		description: 'Uma circulação deve ter pelo menos 10 eventos de veículo.',
		title: 'Menos de 10 eventos de veículo',
	},
	MATCHING_LOCATION_TRANSACTIONS: {
		description: 'As transações de localização devem corresponder aos eventos de veículo.',
		title: 'Transações de localização correspondentes',
	},
	ONTIME_START: {
		description: 'Uma circulação deve começar depois da hora planeada e com um atraso inferior a 5 minutos.',
		title: 'Início a horas',
	},
	SIMPLE_ONE_VALIDATION_TRANSACTION: {
		description: 'Uma circulação deve ter pelo menos uma transação de validação.',
		title: 'Pelo menos uma transação de validação',
	},
	SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION: {
		description: 'Uma circulação deve ter pelo menos um evento ou uma transação de validação.',
		title: 'Pelo menos um evento ou uma transação de validação',
	},
	SIMPLE_THREE_VEHICLE_EVENTS: {
		description: 'Uma circulação deve ter pelo menos três eventos no início, meio e fim da viagem.',
		title: 'Pelo menos três eventos',
	},
	TRANSACTION_SEQUENTIALITY: {
		description: 'Todas as transações geradas pelo validador foram entregues.',
		title: 'Sequencialidade das Transações APEX',
	},
};
