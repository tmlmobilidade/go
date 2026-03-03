import { CalendarRule } from '@/types.js';
import { WEEKDAYS } from '@tmlmobilidade/types';

const PERIODS = {
	ESC: '99H2R',
	FER: '2KIUJ',
	VER: 'UW2U0',
};

export const CalendarRulesCM = new Map<string, CalendarRule[]>([
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
	['8', [
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
	['41', [
		{
			description: 'Dias úteis de férias escolares e verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.VER, PERIODS.FER],
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
	['ESC_DU', [
		{
			description: 'Dias úteis do período escolar',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_QUA', [
		{
			description: 'Quartas-feiras do período escolar',
			weekdays: [WEEKDAYS.Wed],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_QUI', [
		{
			description: 'Quintas-feiras do período escolar',
			weekdays: [WEEKDAYS.Thu],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_SAB', [
		{
			description: 'Sábados do período escolar',
			weekdays: [WEEKDAYS.Sat],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_SEG', [
		{
			description: 'Segundas-feiras do período escolar',
			weekdays: [WEEKDAYS.Mon],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_SEX', [
		{
			description: 'Sextas-feiras do período escolar',
			weekdays: [WEEKDAYS.Fri],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['ESC_TER', [
		{
			description: 'Terças-feiras do período escolar',
			weekdays: [WEEKDAYS.Tue],
			year_period_ids: [PERIODS.ESC],
		},
	]],
	['FER_DOM', [
		{
			description: 'Domingos e feriados do período de férias',
			weekdays: [WEEKDAYS.Sun],
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
	['VER_DOM', [
		{
			description: 'Domingos e feriados do período de verão',
			weekdays: [WEEKDAYS.Sun],
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
