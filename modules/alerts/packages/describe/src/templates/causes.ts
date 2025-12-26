/* * */

import { type TemplateFragment } from '@/types.js';
import { type Alert } from '@tmlmobilidade/types';

/* * */

export const alertI18nTemplateCauses: Record<Alert['cause'], TemplateFragment> = {

	ACCIDENT: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to an accident',
				},
				pt: {
					params: [],
					text: 'Devido a um acidente',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Accident',
				},
				pt: {
					params: [],
					text: 'Acidente',
				},
			},
		},
	},

	CONSTRUCTION: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to construction',
				},
				pt: {
					params: [],
					text: 'Devido a construção',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Road Works',
				},
				pt: {
					params: [],
					text: 'Obras',
				},
			},
		},
	},

	DEMONSTRATION: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a demonstration',
				},
				pt: {
					params: [],
					text: 'Devido a uma manifestação',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Demonstration',
				},
				pt: {
					params: [],
					text: 'Manifestação',
				},
			},
		},
	},

	DRIVER_ABSENCE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a driver issue',
				},
				pt: {
					params: [],
					text: 'Devido a um problema com o motorista',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Driver Issue',
				},
				pt: {
					params: [],
					text: 'Problema com motorista',
				},
			},
		},
	},

	DRIVER_ISSUE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a driver issue',
				},
				pt: {
					params: [],
					text: 'Devido a um problema com o motorista',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Driver Issue',
				},
				pt: {
					params: [],
					text: 'Problema com motorista',
				},
			},
		},
	},

	HIGH_PASSENGER_LOAD: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to high passenger load',
				},
				pt: {
					params: [],
					text: 'Devido a alta carga de passageiros',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'High Passenger Load',
				},
				pt: {
					params: [],
					text: 'Alta carga de passageiros',
				},
			},
		},
	},

	HOLIDAY: {
		description: {
			singular: {
				en: {
					params: ['{holiday_name}'],
					text: 'Due to the holiday "{holiday_name}"',
				},
				pt: {
					params: ['{holiday_name}'],
					text: 'Devido ao feriado "{holiday_name}"',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: ['{holiday_name}'],
					text: 'Holiday "{holiday_name}"',
				},
				pt: {
					params: ['{holiday_name}'],
					text: 'Feriado "{holiday_name}"',
				},
			},
		},
	},

	MAINTENANCE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to maintenance works',
				},
				pt: {
					params: [],
					text: 'Devido a trabalhos de manutenção',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Maintenance',
				},
				pt: {
					params: [],
					text: 'Manutenção',
				},
			},
		},
	},

	MEDICAL_EMERGENCY: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a medical emergency',
				},
				pt: {
					params: [],
					text: 'Devido a uma emergência médica',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Medical Emergency',
				},
				pt: {
					params: [],
					text: 'Emergência Médica',
				},
			},
		},
	},

	OTHER_CAUSE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to other cause',
				},
				pt: {
					params: [],
					text: 'Devido a outra causa',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Other Cause',
				},
				pt: {
					params: [],
					text: 'Outra Causa',
				},
			},
		},
	},

	POLICE_ACTIVITY: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to police activity',
				},
				pt: {
					params: [],
					text: 'Devido a atividade policial',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Police Activity',
				},
				pt: {
					params: [],
					text: 'Atividade Policial',
				},
			},
		},
	},

	ROAD_INCIDENT: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a road incident',
				},
				pt: {
					params: [],
					text: 'Devido a um incidente na estrada',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Road Incident',
				},
				pt: {
					params: [],
					text: 'Incidente na Estrada',
				},
			},
		},
	},

	STRIKE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a strike',
				},
				pt: {
					params: [],
					text: 'Devido à greve',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Strike',
				},
				pt: {
					params: [],
					text: 'Greve',
				},
			},
		},
	},

	SYSTEM_FAILURE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a system failure',
				},
				pt: {
					params: [],
					text: 'Devido a uma falha no sistema',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'System Failure',
				},
				pt: {
					params: [],
					text: 'Falha no Sistema',
				},
			},
		},
	},

	TECHNICAL_PROBLEM: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a technical problem',
				},
				pt: {
					params: [],
					text: 'Devido a um problema técnico',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Technical Problem',
				},
				pt: {
					params: [],
					text: 'Problema Técnico',
				},
			},
		},
	},

	TRAFFIC_JAM: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a traffic jam',
				},
				pt: {
					params: [],
					text: 'Devido ao trânsito intenso e inesperado',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Traffic Jam',
				},
				pt: {
					params: [],
					text: 'Trânsito Intenso e Inesperado',
				},
			},
		},
	},

	UNKNOWN_CAUSE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to an unknown cause',
				},
				pt: {
					params: [],
					text: 'Devido a uma causa desconhecida',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Unknown Cause',
				},
				pt: {
					params: [],
					text: 'Causa Desconhecida',
				},
			},
		},
	},

	VEHICLE_ISSUE: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to a vehicle issue',
				},
				pt: {
					params: [],
					text: 'Devido a um problema no veículo',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Vehicle Issue',
				},
				pt: {
					params: [],
					text: 'Problema no Veículo',
				},
			},
		},
	},

	WEATHER: {
		description: {
			singular: {
				en: {
					params: [],
					text: 'Due to weather conditions',
				},
				pt: {
					params: [],
					text: 'Devido ao mau tempo',
				},
			},
		},
		title: {
			singular: {
				en: {
					params: [],
					text: 'Weather',
				},
				pt: {
					params: [],
					text: 'Mau Tempo',
				},
			},
		},
	},

};
