/* * */

import { type Ride } from '@go/types';

/* * */

type RideAnalysisLabels = Record<keyof Ride['analysis'], {
	description: string
	title: string
}>;

/* * */

export const rideAnalysisLabels: RideAnalysisLabels = {
	AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: {
		description: 'Uma circulação deve ter pelo menos um evento na primeira paragem.',
		title: 'Pelo menos um evento na primeira paragem',
	},
	ENDED_AT_LAST_STOP: {
		description: 'Uma circulação deve terminar na última paragem.',
		title: 'Terminou na última paragem',
	},
	EXPECTED_APEX_VALIDATION_INTERVAL: {
		description: 'O intervalo entre validações é orgânico e representa a variação natural dos tempos de validação dos passageiros.',
		title: 'Intervalo de validações APEX',
	},
	EXPECTED_DRIVER_ID_QTY: {
		description: 'Uma circulação pode ter no máximo dois IDs de motorista diferentes.',
		title: 'No máximo dois motoristas',
	},
	EXPECTED_START_TIME: {
		description: 'Uma circulação deve começar depois da hora planeada e com um atraso inferior a 5 minutos.',
		title: 'Início a horas',
	},
	EXPECTED_VEHICLE_EVENT_DELAY: {
		description: 'Os eventos não devem ser entregues com mais de 10 segundos após a sua geração.',
		title: 'Atraso excessivo na entrega dos eventos',
	},
	EXPECTED_VEHICLE_EVENT_INTERVAL: {
		description: 'O intervalo médio entre eventos não deve exceder os 20 segundos.',
		title: 'Intervalo médio entre eventos',
	},
	EXPECTED_VEHICLE_EVENT_QTY: {
		description: 'Uma circulação deve ter pelo menos 10 eventos de veículo.',
		title: 'Menos de 10 eventos de veículo',
	},
	EXPECTED_VEHICLE_ID_QTY: {
		description: 'Uma circulação pode ter no máximo dois IDs de veículo diferentes.',
		title: 'No máximo dois veículos',
	},
	MATCHING_APEX_LOCATIONS: {
		description: 'As transações de localização devem corresponder aos eventos de veículo.',
		title: 'Transações de localização correspondentes',
	},
	MATCHING_VEHICLE_IDS: {
		description: 'Os IDs do veículos recebidos nos Eventos devem corresponder ao ID das transações APEX.',
		title: 'Vehicle IDs correspondentes',
	},
	SIMPLE_ONE_APEX_VALIDATION: {
		description: 'Uma circulação deve ter pelo menos uma transação de validação.',
		title: 'Pelo menos uma transação de validação',
	},
	SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: {
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
