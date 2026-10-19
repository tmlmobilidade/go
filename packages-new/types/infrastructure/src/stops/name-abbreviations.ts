/* * */

export interface AbbreviationRule {
	enabled: boolean
	phrase: string
	replacement: string
}

/**
 * These are the rules for abbreviating stop names.
 * They follow the CTT National Postal Service guidelines,
 * with some additional customizations for TML.
 */
export const StopNameAbbreviationRules: AbbreviationRule[] = [

	//
	// TML: Street & Place names

	{ enabled: true, phrase: 'Quinta', replacement: 'Qta' },
	{ enabled: true, phrase: 'Largo', replacement: 'Lgo' },
	{ enabled: true, phrase: 'Estrada Municipal', replacement: 'EM' },
	{ enabled: true, phrase: 'Estrada Nacional', replacement: 'EN' },

	//
	// TML: People

	{ enabled: true, phrase: 'Santo', replacement: 'Sto' },
	{ enabled: true, phrase: 'Santa', replacement: 'Sta' },

	//
	// TML: Facilities

	{ enabled: true, phrase: 'Cooperativa', replacement: 'Coop' },
	{ enabled: true, phrase: 'Câmara Municipal', replacement: 'CM' },
	{ enabled: false, phrase: 'Hospital', replacement: 'Hosp' },
	{ enabled: false, phrase: 'Escola', replacement: 'Esc' },

	//
	// CTT: Tipo de artéria
	{ enabled: true, phrase: 'Alameda', replacement: 'Al' },
	{ enabled: true, phrase: 'Avenida', replacement: 'Av' },
	{ enabled: true, phrase: 'Azinhaga', replacement: 'Az' },
	{ enabled: true, phrase: 'Bairro', replacement: 'Br' },
	{ enabled: true, phrase: 'Beco', replacement: 'Bc' },
	{ enabled: true, phrase: 'Calçada', replacement: 'Cc' },
	{ enabled: true, phrase: 'Calçadinha', replacement: 'Ccnh' },
	{ enabled: true, phrase: 'Caminho', replacement: 'Cam' },
	{ enabled: true, phrase: 'Casa', replacement: 'Cs' },
	{ enabled: true, phrase: 'Conjunto', replacement: 'Cj' },
	{ enabled: true, phrase: 'Escadas', replacement: 'Esc' },
	{ enabled: true, phrase: 'Escadinhas', replacement: 'Escnh' },
	{ enabled: true, phrase: 'Estrada', replacement: 'Estr' },
	{ enabled: true, phrase: 'Jardim', replacement: 'Jd' },
	{ enabled: true, phrase: 'Loteamento', replacement: 'Lot' },
	{ enabled: true, phrase: 'Parque', replacement: 'Pq' },
	{ enabled: true, phrase: 'Pátio', replacement: 'Pat' },
	{ enabled: true, phrase: 'Praça', replacement: 'Pc' },
	{ enabled: true, phrase: 'Praceta', replacement: 'Pct' },
	{ enabled: true, phrase: 'Prolongamento', replacement: 'Prl' },
	{ enabled: true, phrase: 'Quadra', replacement: 'Qd' },
	{ enabled: true, phrase: 'Rotunda', replacement: 'Rot' },
	{ enabled: true, phrase: 'Rua', replacement: 'R' },
	{ enabled: true, phrase: 'Transversal', replacement: 'Transv' },
	{ enabled: true, phrase: 'Travessa', replacement: 'Tv' },
	{ enabled: true, phrase: 'Urbanização', replacement: 'Urb' },
	{ enabled: true, phrase: 'Vila', replacement: 'Vl' },
	{ enabled: true, phrase: 'Zona', replacement: 'Zn' },

	//
	// CTT: Tipo de alojamento

	{ enabled: true, phrase: 'Cave', replacement: 'Cv' },
	{ enabled: true, phrase: 'Direito', replacement: 'Dto' },
	{ enabled: true, phrase: 'Esquerdo', replacement: 'Esq' },
	{ enabled: true, phrase: 'Frente', replacement: 'Ft' },
	{ enabled: true, phrase: 'Fundos', replacement: 'Fds' },
	{ enabled: true, phrase: 'Habitação', replacement: 'Hab' },
	{ enabled: true, phrase: 'Loja', replacement: 'Lj' },
	{ enabled: true, phrase: 'Rés-do-chão', replacement: 'R/C' },
	{ enabled: true, phrase: 'Sobreloja', replacement: 'Slj' },
	{ enabled: true, phrase: 'Subcave', replacement: 'Scv' },

	//
	// CTT: Tipo de porta

	{ enabled: true, phrase: 'Apartamento', replacement: 'Apto' },
	{ enabled: true, phrase: 'Bloco', replacement: 'Bl' },
	{ enabled: true, phrase: 'Edifício', replacement: 'Edf' },
	{ enabled: true, phrase: 'Lote', replacement: 'Lt' },
	{ enabled: true, phrase: 'Torre', replacement: 'Tr' },
	{ enabled: true, phrase: 'Vivenda', replacement: 'Vv' },

	//
	// CTT: Abreviatura de título

	{ enabled: true, phrase: 'Alferes', replacement: 'Alf' },
	{ enabled: true, phrase: 'Almirante', replacement: 'Alm' },
	{ enabled: true, phrase: 'Arquiteto', replacement: 'Arq' },
	{ enabled: true, phrase: 'Brigadeiro', replacement: 'Brig' },
	{ enabled: true, phrase: 'Capitão', replacement: 'Cap' },
	{ enabled: true, phrase: 'Comandante', replacement: 'Cmdt' },
	{ enabled: true, phrase: 'Comendador', replacement: 'Comend' },
	{ enabled: true, phrase: 'Conselheiro', replacement: 'Cons' },
	{ enabled: true, phrase: 'Coronel', replacement: 'Cel' },
	{ enabled: true, phrase: 'Dom', replacement: 'D' },
	{ enabled: true, phrase: 'Dona', replacement: 'Da' },
	{ enabled: true, phrase: 'Doutor', replacement: 'Dr' },
	{ enabled: true, phrase: 'Doutora', replacement: 'Dr' },
	{ enabled: true, phrase: 'Duque', replacement: 'Dq' },
	{ enabled: true, phrase: 'Embaixador', replacement: 'Emb' },
	{ enabled: true, phrase: 'Engenheira', replacement: 'Eng' },
	{ enabled: true, phrase: 'Engenheiro', replacement: 'Eng' },
	{ enabled: true, phrase: 'Frei', replacement: 'Fr' },
	{ enabled: true, phrase: 'General', replacement: 'Gen' },
	{ enabled: true, phrase: 'Infante', replacement: 'Inf' },
	{ enabled: true, phrase: 'Marquês', replacement: 'Mq' },
	{ enabled: true, phrase: 'Presidente', replacement: 'Pres' },
	{ enabled: true, phrase: 'Professor', replacement: 'Prof' },
	{ enabled: true, phrase: 'Professora', replacement: 'Prof' },
	{ enabled: true, phrase: 'São', replacement: 'S' },
	{ enabled: true, phrase: 'Sargento', replacement: 'Sarg' },
	{ enabled: true, phrase: 'Tenente', replacement: 'Ten' },
	{ enabled: true, phrase: 'Visconde', replacement: 'Visc' },

	//
	// CTT: Diversos

	{ enabled: true, phrase: 'Associação', replacement: 'Ass' },
	{ enabled: true, phrase: 'Instituto', replacement: 'Inst' },
	{ enabled: true, phrase: 'Lugar', replacement: 'Lug' },
	{ enabled: true, phrase: 'Ministério', replacement: 'Min' },
	{ enabled: true, phrase: 'Ministério', replacement: 'Min' },
	{ enabled: true, phrase: 'Projetada', replacement: 'Proj' },
	{ enabled: true, phrase: 'Sala', replacement: 'Sl' },
	{ enabled: true, phrase: 'Sem Número', replacement: 'S/N' },
	{ enabled: true, phrase: 'Sociedade', replacement: 'Soc' },
	{ enabled: false, phrase: 'Universidade', replacement: 'Univ' },

	//
];
