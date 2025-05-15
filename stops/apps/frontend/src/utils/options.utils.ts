/* eslint-disable perfectionist/sort-objects */

/* * */

export enum StopPropertyOperationalStatus {
	Active = 'ACTIVE',
	Inactive = 'INACTIVE',
	Provisional = 'PROVISIONAL',
	Seasonal = 'SEASONAL',
	Voided = 'VOIDED',
}

export enum StopPropertyRoadType {
	ComplementaryItinerary = 'COMPLEMENTARY_ITINERARY',
	Highway = 'HIGHWAY',
	MainItinerary = 'MAIN_ITINERARY',
	NationalRoad = 'NATIONAL_ROAD',
	RegionalRoad = 'REGIONAL_ROAD',
	SecondaryRoad = 'SECONDARY_ROAD',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyHasPole {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasCover {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasShelter {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasMupi {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasBench {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasTrashBin {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasLighting {
	Confortable = 'CONFORTABLE',
	Damaged = 'DAMAGED',
	Insuficient = 'INSUFICIENT',
	Moderate = 'MODERATE',
	Unavailable = 'UNAVAILABLE',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyHasElectricity {
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyDockingBayType {
	Bay = 'BAY',
	Island = 'ISLAND',
	Peninsula = 'PENINSULA',
	RoadMarks = 'ROAD_MARKS',
	Simple = 'SIMPLE',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyHasFlag {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasPipStatic {
	Legacy = 'LEGACY',
	No = 'NO',
	Type1 = 'TYPE_1',
	Type2 = 'TYPE_2',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyHasPipAudio {
	Legacy = 'LEGACY',
	No = 'NO',
	Type1 = 'TYPE_1',
	Type2 = 'TYPE_2',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyHasPipRealtime {
	Legacy = 'LEGACY',
	No = 'NO',
	Type1 = 'TYPE_1',
	Type2 = 'TYPE_2',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyHasH2oaSignage {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasSchedules {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasTactileSchedules {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasNetworkMap {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasSidewalk {
	No = 'NO',
	Type1 = 'TYPE_1',
	Type2 = 'TYPE_2',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyHasCrossing {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasFlatAccess {
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasWideAccess {
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasTactileAccess {
	Damaged = 'DAMAGED',
	Missing = 'MISSING',
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

export enum StopPropertyHasAbusiveParking {
	AbusiveIllegal = 'ABUSIVE_ILLEGAL',
	AbusiveLegal = 'ABUSIVE_LEGAL',
	No = 'NO',
	Unknown = 'UNKNOWN',
}

export enum StopPropertyWheelchairBoarding {
	No = 'NO',
	Unknown = 'UNKNOWN',
	Yes = 'YES',
}

/* * */

export const StopOptions = {
	//

	/*
   * STORAGE SCOPE
   */

	storage_scope: 'stops',

	/*
   * MINIMUM STOP NAME LENGTH
   */

	min_stop_name_length: 5,

	/*
   * MAXIMUM STOP NAME LENGTH
   */

	max_stop_name_length: 100,

	/*
   * MAXIMUM STOP SHORT NAME LENGTH
   */

	max_stop_short_name_length: 55,

	/*
   * STOP NAME ABBREVIATIONS
   * Lista de abreviaturas recomendadas pelos CTT
   * https://pt.wikipedia.org/wiki/Lista_de_abreviaturas_recomendadas_pelos_CTT
   * Obrigado @ricardojorgerm pela sugestão.
   */

	name_abbreviations: [
		//
		// TML: Street & Place names
		{ phrase: 'Quinta', replacement: 'Qta.', enabled: true },
		{ phrase: 'Largo', replacement: 'Lgo.', enabled: true },
		{ phrase: 'Estrada Municipal', replacement: 'EM', enabled: true },
		{ phrase: 'Estrada Nacional', replacement: 'EN', enabled: true },
		// TML: People
		{ phrase: 'Santo', replacement: 'Sto.', enabled: true },
		{ phrase: 'Santa', replacement: 'Sta.', enabled: true },
		// TML: Facilities
		{ phrase: 'Cooperativa', replacement: 'Coop.', enabled: true },
		{ phrase: 'Câmara Municipal', replacement: 'CM', enabled: true },
		{ phrase: 'Hospital', replacement: 'Hosp.', enabled: false },
		{ phrase: 'Escola', replacement: 'Esc.', enabled: false },
		//
		// CTT: Tipo de artéria
		{ phrase: 'Alameda', replacement: 'Al.', enabled: true },
		{ phrase: 'Avenida', replacement: 'Av.', enabled: true },
		{ phrase: 'Azinhaga', replacement: 'Az.', enabled: true },
		{ phrase: 'Bairro', replacement: 'Br.', enabled: true },
		{ phrase: 'Beco', replacement: 'Bc.', enabled: true },
		{ phrase: 'Calçada', replacement: 'Cc.', enabled: true },
		{ phrase: 'Calçadinha', replacement: 'Ccnh.', enabled: true },
		{ phrase: 'Caminho', replacement: 'Cam.', enabled: true },
		{ phrase: 'Casa', replacement: 'Cs.', enabled: true },
		{ phrase: 'Conjunto', replacement: 'Cj.', enabled: true },
		{ phrase: 'Escadas', replacement: 'Esc.', enabled: true },
		{ phrase: 'Escadinhas', replacement: 'Escnh.', enabled: true },
		{ phrase: 'Estrada', replacement: 'Estr.', enabled: true },
		{ phrase: 'Jardim', replacement: 'Jd.', enabled: true },
		{ phrase: 'Loteamento', replacement: 'Lot.', enabled: true },
		{ phrase: 'Parque', replacement: 'Pq.', enabled: true },
		{ phrase: 'Pátio', replacement: 'Pat.', enabled: true },
		{ phrase: 'Praça', replacement: 'Pc.', enabled: true },
		{ phrase: 'Praceta', replacement: 'Pct.', enabled: true },
		{ phrase: 'Prolongamento', replacement: 'Prl.', enabled: true },
		{ phrase: 'Quadra', replacement: 'Qd.', enabled: true },
		{ phrase: 'Rotunda', replacement: 'Rot.', enabled: true },
		{ phrase: 'Rua', replacement: 'R.', enabled: true },
		{ phrase: 'Transversal', replacement: 'Transv.', enabled: true },
		{ phrase: 'Travessa', replacement: 'Tv.', enabled: true },
		{ phrase: 'Urbanização', replacement: 'Urb.', enabled: true },
		{ phrase: 'Vila', replacement: 'Vl.', enabled: true },
		{ phrase: 'Zona', replacement: 'Zn.', enabled: true },
		// CTT: Tipo de alojamento
		{ phrase: 'Cave', replacement: 'Cv.', enabled: true },
		{ phrase: 'Direito', replacement: 'Dto.', enabled: true },
		{ phrase: 'Esquerdo', replacement: 'Esq.', enabled: true },
		{ phrase: 'Frente', replacement: 'Ft.', enabled: true },
		{ phrase: 'Fundos', replacement: 'Fds.', enabled: true },
		{ phrase: 'Habitação', replacement: 'Hab.', enabled: true },
		{ phrase: 'Loja', replacement: 'Lj.', enabled: true },
		{ phrase: 'Rés-do-chão', replacement: 'R/C', enabled: true },
		{ phrase: 'Sobreloja', replacement: 'Slj.', enabled: true },
		{ phrase: 'Subcave', replacement: 'Scv.', enabled: true },
		// CTT: Tipo de porta
		{ phrase: 'Apartamento', replacement: 'Apto.', enabled: true },
		{ phrase: 'Bloco', replacement: 'Bl.', enabled: true },
		{ phrase: 'Edifício', replacement: 'Edf.', enabled: true },
		{ phrase: 'Lote', replacement: 'Lt.', enabled: true },
		{ phrase: 'Torre', replacement: 'Tr.', enabled: true },
		{ phrase: 'Vivenda', replacement: 'Vv.', enabled: true },
		// CTT: Abreviatura de título
		{ phrase: 'Alferes', replacement: 'Alf.', enabled: true },
		{ phrase: 'Almirante', replacement: 'Alm.', enabled: true },
		{ phrase: 'Arquiteto', replacement: 'Arq.', enabled: true },
		{ phrase: 'Brigadeiro', replacement: 'Brig.', enabled: true },
		{ phrase: 'Capitão', replacement: 'Cap.', enabled: true },
		{ phrase: 'Comandante', replacement: 'Cmdt.', enabled: true },
		{ phrase: 'Comendador', replacement: 'Comend.', enabled: true },
		{ phrase: 'Conselheiro', replacement: 'Cons.', enabled: true },
		{ phrase: 'Coronel', replacement: 'Cel.', enabled: true },
		{ phrase: 'Dom', replacement: 'D.', enabled: true },
		{ phrase: 'Dona', replacement: 'Da.', enabled: true },
		{ phrase: 'Doutor', replacement: 'Dr.', enabled: true },
		{ phrase: 'Doutora', replacement: 'Dr.', enabled: true },
		{ phrase: 'Duque', replacement: 'Dq.', enabled: true },
		{ phrase: 'Embaixador', replacement: 'Emb.', enabled: true },
		{ phrase: 'Engenheira', replacement: 'Eng.', enabled: true },
		{ phrase: 'Engenheiro', replacement: 'Eng.', enabled: true },
		{ phrase: 'Frei', replacement: 'Fr.', enabled: true },
		{ phrase: 'General', replacement: 'Gen.', enabled: true },
		{ phrase: 'Infante', replacement: 'Inf.', enabled: true },
		{ phrase: 'Marquês', replacement: 'Mq.', enabled: true },
		{ phrase: 'Presidente', replacement: 'Pres.', enabled: true },
		{ phrase: 'Professor', replacement: 'Prof.', enabled: true },
		{ phrase: 'Professora', replacement: 'Prof.', enabled: true },
		{ phrase: 'São', replacement: 'S.', enabled: true },
		{ phrase: 'Sargento', replacement: 'Sarg.', enabled: true },
		{ phrase: 'Tenente', replacement: 'Ten.', enabled: true },
		{ phrase: 'Visconde', replacement: 'Visc.', enabled: true },
		// CTT: Diversos
		{ phrase: 'Associação', replacement: 'Ass.', enabled: true },
		{ phrase: 'Instituto', replacement: 'Inst.', enabled: true },
		{ phrase: 'Lugar', replacement: 'Lug.', enabled: true },
		{ phrase: 'Ministério', replacement: 'Min.', enabled: true },
		{ phrase: 'Ministério', replacement: 'Min.', enabled: true },
		{ phrase: 'Projetada', replacement: 'Proj.', enabled: true },
		{ phrase: 'Sala', replacement: 'Sl.', enabled: true },
		{ phrase: 'Sem Número', replacement: 'S/N', enabled: true },
		{ phrase: 'Sociedade', replacement: 'Soc.', enabled: true },
		{ phrase: 'Universidade', replacement: 'Univ.', enabled: false },
		//
	],

	/*
   * OPERATIONAL STATUS
   */

	operational_status: Object.values(StopPropertyOperationalStatus),

	/*
   * INFRASTRUCTURE
   */

	has_pole: Object.values(StopPropertyHasPole),

	has_cover: Object.values(StopPropertyHasShelter),

	has_shelter: Object.values(StopPropertyHasShelter),

	has_mupi: Object.values(StopPropertyHasMupi),

	has_bench: Object.values(StopPropertyHasBench),

	has_trash_bin: Object.values(StopPropertyHasTrashBin),

	has_lighting: Object.values(StopPropertyHasLighting),

	has_electricity: Object.values(StopPropertyHasElectricity),

	docking_bay_type: Object.values(StopPropertyDockingBayType),

	/*
   * PUBLIC INFORMATION
   */

	has_flag: Object.values(StopPropertyHasFlag),

	has_pip_static: Object.values(StopPropertyHasPipStatic),

	has_pip_audio: Object.values(StopPropertyHasPipAudio),

	has_pip_realtime: Object.values(StopPropertyHasPipRealtime),

	has_h2oa_signage: Object.values(StopPropertyHasH2oaSignage),

	has_schedules: Object.values(StopPropertyHasSchedules),

	has_tactile_schedules: Object.values(StopPropertyHasTactileSchedules),

	has_network_map: Object.values(StopPropertyHasNetworkMap),

	/*
   * ACCESSIBILITY
   */

	has_sidewalk: Object.values(StopPropertyHasSidewalk),

	has_crossing: Object.values(StopPropertyHasCrossing),

	has_flat_access: Object.values(StopPropertyHasFlatAccess),

	has_wide_access: Object.values(StopPropertyHasWideAccess),

	has_tactile_access: Object.values(StopPropertyHasTactileAccess),

	has_abusive_parking: Object.values(StopPropertyHasAbusiveParking),

	wheelchair_boarding: Object.values(StopPropertyWheelchairBoarding),

	//
};
