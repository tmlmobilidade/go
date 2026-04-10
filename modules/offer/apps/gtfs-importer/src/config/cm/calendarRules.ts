import { CalendarRule } from '@/types.js';
import { WEEKDAYS } from '@tmlmobilidade/types';

const PERIODS = {
	ESC: '99H2R',
	FER: '2KIUJ',
	VER: 'UW2U0',
};

export const CalendarRulesCM = new Map<string, CalendarRule[]>([
	['1', [
		{
			description: 'Todos os dias do ano',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
	]],
	['2', [
		{
			description: 'Todos os dias úteis e domingos/feriados',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['3', [
		{
			description: 'Todos os dias úteis e sábados',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['4', [
		{
			description: 'Dias úteis todo o ano',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],
	['5', [
		{
			description: 'Domingos/feriados todo o ano',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],
	['7', [
		{
			description: 'Sábados (exceto feriados) todo o ano',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],

	['7-OFF-ESP_CARNAVAL_DIA', [
		{
			description: 'Sábados (exceto feriados) todo o ano',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['7-OFF-ESP_SANTOS_DIA', [
		{
			description: 'Sábados (exceto feriados) todo o ano',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['8', [
		{
			description: 'Sábados e Domingos/feriados todo o ano',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],
	['8-OFF-ESP_CARNAVAL_DIA', [
		{
			description: 'Sábados e Domingos/feriados todo o ano',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],
	['11', [
		{
			description: 'Sextas feiras e sábados todo o ano, excepto feriados',
			weekdays: [WEEKDAYS.Fri, WEEKDAYS.Sat],
			year_period_ids: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
	]],
	['15', [
		{
			description: 'Dias úteis do período escolar',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['28', [
		{
			description: 'Segunda, terças, quintas e sextas de período escolar, excepto feriados',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['36', [
		{
			description: 'Dias úteis exceto verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER, PERIODS.ESC],
		},
	]],
	['40', [
		{
			description: 'Todos os dias exceto entre 4 de junho a 15 de setembro',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
		{
			event_id: 'PLRXJ',
			isExclude: true,
		},
	]],
	['41', [
		{
			description: 'Dias úteis de férias escolares e verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER, PERIODS.FER],
		},
	]],
	['51', [
		{
			description: 'Dias úteis do período de verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['56', [
		{
			description: 'Todos os dias de verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['100', [
		{
			description: 'Sábados todo o ano',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
		{
			description: 'Dias úteis de período escolar',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['102', [
		{
			description: 'Sábados todo o ano',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
		{
			description: 'Dias úteis de verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['109', [
		{
			description: 'Domingos e feriados todo o ano',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
		{
			description: 'Dias úteis de férias escolares e verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER, PERIODS.FER],
		},
	]],
	['124', [
		{
			description: 'A4 - Sábados, domingos e feriados de 4 junho a 14 setembro, dias úteis de 30 junho a 10 setembro',
			event_id: 'PLRXJ',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
		},
		{
			event_id: 'VQUZ7',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
		},
	]],
	['125', [
		{
			description: 'A4 - Sábados, domingos, feriados de 4 junho a 14 setembro',
			event_id: 'PLRXJ',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
		},
	]],
	['126', [
		{
			description: 'A4 - Dias úteis de 1 julho a 10 de setembro',
			event_id: 'VQUZ7',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
		},
	]],
	['127', [
		{
			description: 'Dias úteis de 5 junho a 29 junho e de 11 de setembro a 15 de setembro',
			event_id: 'FJ614',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
		},
	]],
	['128', [
		{
			description: 'A4 - Dias úteis de 5 junho a 15 setembro',
			event_id: 'PLRXJ',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
		},
	]],
	['129', [
		{
			description: 'A4 - Todos os dias entre o dia 4 junho e 15 setembro',
			event_id: 'PLRXJ',
		},
	]],
	['162', [
		{
			description: 'Feira de Santiago',
			event_id: 'MN4FX',
		},
	]],
	['163', [
		{
			description: 'Todos os dias do ano',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
		{
			description: 'Feira de Santiago',
			event_id: 'MN4FX',
			isExclude: true,
		},
	]],
	['164', [
		{
			description: 'Dias úteis, durante o período da Feira de Santiago',
			event_id: 'MN4FX',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
		},
	]],
	['166', [
		{
			description: 'Fins de semana, durante o período da Feira de Santiago',
			event_id: 'MN4FX',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
		},
	]],
	['168', [
		{
			description: 'A4 - Sextas-feiras e sábados (exceto feriados) e último domingo, durante o período da Feira de Santiago (Setúbal)',
			event_id: 'MN4FX',
			weekdays: [WEEKDAYS.Fri, WEEKDAYS.Sat],
		},
		{
			event_id: 'M0R7U',
		},
	]],
	['180', [
		{
			description: 'A4 - Dias úteis, durante o período de funcionamento das Piscinas das manteigadas',
			event_id: '1C64V',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat],
		},
	]],
	['181', [
		{
			description: 'A4 - Sábados, domingos e feriados, durante o período de funcionamento das Piscinas das manteigadas',
			event_id: '1C64V',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
		},
	]],
	['182', [
		{
			description: 'A4 - Dias úteis no período escolar, exceto durante o período de funcionamento das Piscinas das manteigadas',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: '1C64V',
			isExclude: true,
		},
	]],
	['183', [
		{
			description: 'A4 - Sábados, domingos e feriados, exceto durante o período de funcionamento das Piscinas Manteigadas',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: '1C64V',
			isExclude: true,
		},
	]],
	['184', [
		{
			description: 'A4 - Dias úteis, exceto durante o período de funcionamento das piscinas das manteigadas',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
		{
			event_id: '1C64V',
			isExclude: true,
		},
	]],
	['190', [
		{
			description: 'A4 - Dias úteis, com exceção nos dias da Festa do Avante',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
		{
			event_id: 'N17H6',
			isExclude: true,
		},
	]],
	['191', [
		{
			description: 'A4 - Sextas-feiras, durante a Festa do Avante',
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Fri],
		},
	]],
	['192', [
		{
			description: 'A4 - Sábados e domingos, durante a Festa do Avante',
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
		},
	]],
	['193', [
		{
			description: 'A4 - Sábados, durante a Festa do Avante',
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Sat],
		},
	]],
	['194', [
		{
			description: 'A4 - Sextas-feiras, sábados e domingos, durante a Festa do Avante',
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
		},
	]],
	['195', [
		{
			description: 'A4 - Sextas-feiras e sábados, durante a Festa do Avante',
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Fri, WEEKDAYS.Sat],
		},
	]],
	['432', [
		{
			event_id: '594HB',
		},
	]],
	['511', [
		{
			months: [5, 6, 7, 8, 9],
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['512', [
		{
			months: [5, 6, 7, 8, 9],
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['513', [
		{
			description: '#5.1.3. Outubro a Abril',
			months: [10, 11, 12, 1, 2, 3, 4],
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['514', [
		{
			description: '#5.1.4.DU Outubro a Abril',
			months: [10, 11, 12, 1, 2, 3, 4],
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['582', [
		{
			description: '#5.8.2. Meses - Agosto - Sábados',
			months: [8],
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['583', [
		{
			description: '#5.8.3. Meses - Agosto - Domingos',
			months: [8],
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['8125', [
		{
			description: 'Sábados e Domingos/feriados todo o ano (OFF A4 - Sábados, domingos, feriados de 4 junho a 14 setembro)',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
		{
			event_id: 'PLRXJ',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
		},
	]],
	['8125', [
		{
			description: 'Sábados e Domingos/feriados todo o ano, OFF A4 - Sábados, domingos, feriados de 4 junho a 14 setembro',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],
	['8432', [
		{
			description: 'Sábados e Domingos/feriados todo o ano, OFF-ESP_SANTOS_DIA',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
		{
			event_id: '594HB',
			isExclude: true,
		},
	]],
	['15561', [
		{
			description: 'Dias úteis do período escolar (ignorar evento Trafaria Bluegrass)',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['21561', [
		{
			description: 'Quartas-feiras do período escolar (ignorar evento Trafaria Bluegrass)',
			weekdays: [WEEKDAYS.Wed],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['28561', [
		{
			description: 'Segunda, terças, quintas e sextas de período escolar, excepto feriados (ignorar evento Trafaria Bluegrass)',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['30561', [
		{
			description: 'Sextas-feiras do período escolar (ignorar evento Trafaria Bluegrass)',
			weekdays: [WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ANO', [
		{
			description: 'Todos os dias do ano',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			year_period_ids: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
	]],
	['ESC_DOM', [
		{
			description: 'Domingos e feriados do período escolar',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_DOM_1', [
		{
			event_id: '9AQDF',
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_DU', [
		{
			description: 'Dias úteis do período escolar',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_DU-OFF-ESP_SANTOS_DIA', [
		{
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: '594HB',
			isExclude: true,
		},
	]],
	['ESC_DU-OFF-ESP_SANTOS_VESP', [
		{
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: 'XTC9J',
			isExclude: true,
		},
	]],
	['ESC_DU-OFF-FER_MAFRA', [
		{
			description: 'Dias úteis do período escolar',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: 'AND6D',
			isExclude: true,
		},
	]],
	['ESC_QUA', [
		{
			description: 'Quartas-feiras do período escolar',
			weekdays: [WEEKDAYS.Wed],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_QUA-OFF-FER_MAFRA', [
		{
			description: 'Quartas-feiras do período escolar',
			weekdays: [WEEKDAYS.Wed],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: 'AND6D',
			isExclude: true,
		},
	]],
	['ESC_QUI', [
		{
			description: 'Quintas-feiras do período escolar',
			weekdays: [WEEKDAYS.Thu],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_QUI-OFF-FER_MAFRA', [
		{
			description: 'Quintas-feiras do período escolar',
			weekdays: [WEEKDAYS.Thu],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: 'AND6D',
			isExclude: true,
		},
	]],
	['ESC_SAB', [
		{
			description: 'Sábados do período escolar',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_SAB-OFF-ESP_SANTOS_DIA', [
		{
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: '594HB',
			isExclude: true,
		},
	]],
	['ESC_SEG', [
		{
			description: 'Segundas-feiras do período escolar',
			weekdays: [WEEKDAYS.Mon],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_SEG-OFF-FER_MAFRA', [
		{
			description: 'Segundas-feiras do período escolar',
			weekdays: [WEEKDAYS.Mon],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: 'AND6D',
			isExclude: true,
		},
	]],
	['ESC_SEX', [
		{
			description: 'Sextas-feiras do período escolar',
			weekdays: [WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_SEX-OFF-FER_MAFRA', [
		{
			description: 'Sextas-feiras do período escolar',
			weekdays: [WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: 'AND6D',
			isExclude: true,
		},
	]],
	['ESC_TER', [
		{
			description: 'Terças-feiras do período escolar',
			weekdays: [WEEKDAYS.Tue],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_TER-OFF-FER_MAFRA', [
		{
			description: 'Terças-feiras do período escolar',
			weekdays: [WEEKDAYS.Tue],
			year_period_ids: [PERIODS.ESC],
		},
		{
			event_id: 'AND6D',
			isExclude: true,
		},
	]],
	['ESP_BT_FDS', [
		{
			event_id: '45NK2',
		},
	]],
	['ESP_CARNAVAL_DIA', [
		{
			event_id: '0BMM2',
		},
	]],
	// ['ESP_CARNAVAL_FDS', [
	// 	{
	// 		event_id: 'B0R1W',
	// 		weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
	// 	},
	// ]],
	// ['ESP_CARNAVAL_SEG', [
	// 	{
	// 		event_id: 'B0R1W',
	// 		weekdays: [WEEKDAYS.Mon],
	// 	},
	// ]],
	['ESP_SANTOS_DIA', [
		{
			event_id: '594HB',
		},
	]],
	['ESP_SANTOS_VESP', [
		{
			event_id: 'XTC9J',
		},
	]],
	['EVENTOS_AVANTE_DOM', [
		{
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Sun],
		},
	]],
	['EVENTOS_AVANTE_SAB', [
		{
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Sat],
		},
	]],
	['EVENTOS_AVANTE_SEX', [
		{
			event_id: 'N17H6',
			weekdays: [WEEKDAYS.Fri],
		},
	]],
	['EVENTOS_SOL_DOM', [
		{
			event_id: 'X3MSP',
			weekdays: [WEEKDAYS.Sun],
		},
	]],
	['EVENTOS_SOL_DU', [
		{
			event_id: 'X3MSP',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
		},
	]],
	['EVENTOS_SOL_SAB', [
		{
			event_id: 'X3MSP',
			weekdays: [WEEKDAYS.Sat],
		},
	]],
	['EVENTOS_SUMOL_TOD', [
		{
			event_id: '6XT8T',
		},
	]],
	['FER_DOM', [
		{
			description: 'Domingos e feriados do período de férias',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DOM-OFF-ESP_ANONOVO_DIA-ESP_NATAL_DIA', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DOM-OFF-ESP_NATAL_DIA', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DOM-OFF-ESP_NATAL_DIA-ESP_ANONOVO_DIA', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DOM_1', [
		{
			event_id: '9AQDF',
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DU', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DU-OFF-ESP_ANONOVO_VESP', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DU-OFF-ESP_ANONOVO_VESP-ESP_NATAL_VESP', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DU-OFF-ESP_CARNAVAL_DIA', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DU-OFF-ESP_NATAL_VESP', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_DU-OFF-ESP_NATAL_VESP-ESP_ANONOVO_VESP', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_QUA', [
		{
			description: 'Quartas-feiras do período de férias',
			weekdays: [WEEKDAYS.Wed],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_QUI', [
		{
			description: 'Quintas-feiras do período de férias',
			weekdays: [WEEKDAYS.Thu],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_SAB', [
		{
			description: 'Sábados do período de férias',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_SEG', [
		{
			description: 'Segundas-feiras do período de férias',
			weekdays: [WEEKDAYS.Mon],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_SEX', [
		{
			description: 'Sextas-feiras do período de férias',
			weekdays: [WEEKDAYS.Fri],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['FER_TER', [
		{
			description: 'Terças-feiras do período de férias',
			weekdays: [WEEKDAYS.Tue],
			year_period_ids: [PERIODS.FER],
		},
	]],
	['MES_JUN_U2S', [
		{
			event_id: 'FDETG',
		},
	]],
	['VER_DOM', [
		{
			description: 'Domingos e feriados do período de verão',
			weekdays: [WEEKDAYS.Sun],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_DOM_1', [
		{
			event_id: '9AQDF',
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_DU', [
		{
			description: 'Dias úteis do período de verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_QUA', [
		{
			description: 'Quartas-feiras do período de verão',
			weekdays: [WEEKDAYS.Wed],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_QUI', [
		{
			description: 'Quintas-feiras do período de verão',
			weekdays: [WEEKDAYS.Thu],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_SAB', [
		{
			description: 'Sábados do período de verão',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_SEG', [
		{
			description: 'Segundas-feiras do período de verão',
			weekdays: [WEEKDAYS.Mon],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_SEX', [
		{
			description: 'Sextas-feiras do período de verão',
			weekdays: [WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER],
		},
	]],
	['VER_TER', [
		{
			description: 'Terças-feiras do período de verão',
			weekdays: [WEEKDAYS.Tue],
			year_period_ids: [PERIODS.VER],
		},
	]],
]);
