/* * */

export interface BaseResponse<T> {
	codigo: number
	resposta: T
}

/**
 * @see GET /tempoEspera/Estacao/todos
 * @see GET /tempoEspera/Estacao/{estacao}
 * @see GET /tempoEspera/Linha/{linha}
 */
export interface TempoEspera {
	comboio: string
	destino: string
	estacao: string
	linha: string
	nomeEstacao: string
	tempoEspera: string
}

/**
 * Raw response item from GET /tempoEspera/Linha/{linha}.
 * Each entry represents a stop/platform with up to 3 upcoming trains.
 */
export interface TempoEsperaRawItem {
	cais: string
	comboio: string
	comboio2: string
	comboio3: string
	destino: string
	hora: string
	sairServico: string
	stop_id: string
	tempoChegada1: string
	tempoChegada2: string
	tempoChegada3: string
}

/**
 * @see GET /infoEstacao/todos
 * @see GET /infoEstacao/{estacao}
 */
export interface InfoEstacao {
	id: string
	latitude: number
	linha: string
	longitude: number
	nome: string
	url?: string
}

/**
 * @see GET /estadoLinha/todos
 * @see GET /estadoLinha/{linha}
 */
export interface EstadoLinha {
	descricao: string
	estado: string
	linha: string
}

export const DESTINATION_MAP = {
	33: {
		code: 'RB',
		name: 'Reboleira',
	},
	34: {
		code: 'AS',
		name: 'Amadora Este',
	},
	35: {
		code: 'PO',
		name: 'Pontinha',
	},
	36: {
		code: 'CM',
		name: 'Colégio Militar/Luz',
	},
	37: {
		code: 'LA',
		name: 'Laranjeiras',
	},
	38: {
		code: 'SS',
		name: 'São Sebastião',
	},
	39: {
		code: 'AV',
		name: 'Avenida',
	},
	40: {
		code: 'BC',
		name: 'Baixa-Chiado',
	},
	41: {
		code: 'TP',
		name: 'Terreiro do Paço',
	},
	42: {
		code: 'SP',
		name: 'Santa Apolónia',
	},
	43: {
		code: 'OD',
		name: 'Odivelas',
	},
	44: {
		code: 'LU',
		name: 'Lumiar',
	},
	45: {
		code: 'CG',
		name: 'Campo Grande',
	},
	46: {
		code: 'CP',
		name: 'Campo Pequeno',
	},
	48: {
		code: 'RA',
		name: 'Rato',
	},
	50: {
		code: 'TE',
		name: 'Telheiras',
	},
	51: {
		code: 'AL',
		name: 'Alvalade',
	},
	52: {
		code: 'AM',
		name: 'Alameda',
	},
	53: {
		code: 'MM',
		name: 'Martim Moniz',
	},
	54: {
		code: 'CS',
		name: 'Cais do Sodré',
	},
	56: {
		code: 'BV',
		name: 'Bela Vista',
	},
	57: {
		code: 'CH',
		name: 'Chelas',
	},
	59: {
		code: 'MO',
		name: 'Moscavide',
	},
	60: {
		code: 'AP',
		name: 'Aeroporto',
	},
} as const;
