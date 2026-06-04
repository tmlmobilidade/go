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
