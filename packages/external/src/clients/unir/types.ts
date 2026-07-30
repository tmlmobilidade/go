/* * */

/**
 * @see GET /amp/api-sa/localizacoes-veiculos-direto
 */
export interface UnirVehicleLocationResponse {
	code: number
	message: UnirVehicleLocation[]
	timestamp: string
}

export interface UnirVehicleLocation {
	atrasoMaximo: number
	atrasoMedio: number
	avancoMaximo: number
	avancoMedio: number
	codigoPublicoLinha: string
	codigoServico: string
	codigoUltimaParagem: string
	estado: string
	estadoCumprimento: string
	estaNaParagem: boolean
	horaUltimoEvento: string
	id: string
	instanteAtualizacao: string
	latitude: number
	longitude: number
	nomeLinha: string
	nomeOperador: string
	numAtrasos: number
	numAvancos: number
	numeroIdentificacaoVeiculo: string
	numEventos: number
	numExcessosLatenciaChegadaPartidaParagem: number
	numExcessosLatenciaInicioFimServico: number
	numExcessosLatenciaLocalizacao: number
	numTotalSaidasRota: number
	operadorId: number
	recordedAtTime: string
	recordedProcessAtTime: string
	stopPointRef: string
	temDadosCompletos: boolean
	vehicleAtStop: boolean
	vehicleRef: string
	velocity: number
}
