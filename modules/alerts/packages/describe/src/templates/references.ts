/* * */

import { type TemplateFragment } from '@/types.js';
import { type Alert } from '@tmlmobilidade/types';

/* * */

export const alertI18nTemplateReferences: Record<Alert['reference_type'], { multiple: TemplateFragment, single: TemplateFragment }> = {

	lines: {
		multiple: {
			description: {
				plural: {
					en: {
						params: ['{line_short_name[]}'],
						text: 'as linhas {line_short_name[]}',
					},
					pt: {
						params: ['{line_short_name[]}'],
						text: 'as linhas {line_short_name[]}',
					},
				},
				singular: {
					en: {
						params: ['{line_short_name}'],
						text: 'a linha {line_short_name}',
					},
					pt: {
						params: ['{line_short_name}'],
						text: 'a linha {line_short_name}',
					},
				},
			},
			title: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
		},
		single: {
			description: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
			title: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
		},
	},

	rides: {
		multiple: {
			description: {
				plural: {
					en: {
						params: ['{start_time[]}'],
						text: 'the trips for {start_time[]}',
					},
					pt: {
						params: ['{start_time[]}', '{line_short_name}'],
						text: 'as viagens com horário de partida às {start_time[]} da linha {line_short_name}',
					},
				},
				singular: {
					en: {
						params: ['{start_time}', '{line_short_name}'],
						text: 'the trip for {start_time} for the line {line_short_name}',
					},
					pt: {
						params: ['{start_time}', '{line_short_name}'],
						text: 'a viagem com horário de partida às {start_time} da linha {line_short_name}',
					},
				},
			},
			title: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
		},
		single: {
			description: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
			title: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
		},
	},

	stops: {
		multiple: {
			description: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
			title: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
		},
		single: {
			description: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
			title: {
				plural: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
				singular: {
					en: {
						params: [],
						text: 'medical emergency',
					},
					pt: {
						params: [],
						text: 'emergência médica',
					},
				},
			},
		},
	},

};
