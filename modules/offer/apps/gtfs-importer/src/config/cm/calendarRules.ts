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
			yearPeriodIds: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['3', [
		{
			description: 'Todos os dias úteis e sábados',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['4', [
		{
			description: 'Dias úteis todo o ano',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],
	['5', [
		{
			description: 'Domingos/feriados todo o ano',
			weekdays: [WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],

	['7', [
		{
			description: 'Sábados (exceto feriados) todo o ano',
			weekdays: [WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
	]],
	['8', [
		{
			description: 'Sábados e Domingos/feriados todo o ano',
			weekdays: [WEEKDAYS.Sat, WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.FER, PERIODS.ESC, PERIODS.VER],
		},
	]],
	['11', [
		{
			description: 'Sextas feiras e sábados todo o ano, excepto feriados',
			weekdays: [WEEKDAYS.Fri, WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
	]],
	['28', [
		{
			description: 'Segunda, terças, quintas e sextas de período escolar, excepto feriados',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['36', [
		{
			description: 'Dias úteis exceto verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.FER, PERIODS.ESC],
		},
	]],
	['41', [
		{
			description: 'Dias úteis de férias escolares e verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.VER, PERIODS.FER],
		},
	]],
	['56', [
		{
			description: 'Todos os dias de verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['100', [
		{
			description: 'Sábados todo o ano',
			weekdays: [WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
		{
			description: 'Dias úteis de período escolar',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['102', [
		{
			description: 'Sábados todo o ano',
			weekdays: [WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
		{
			description: 'Dias úteis de verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['109', [
		{
			description: 'Domingos e feriados todo o ano',
			weekdays: [WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.VER, PERIODS.FER, PERIODS.ESC],
		},
		{
			description: 'Dias úteis de férias escolares e verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.VER, PERIODS.FER],
		},
	]],
	['ANO', [
		{
			description: 'Todos os dias do ano',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri, WEEKDAYS.Sat, WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.ESC, PERIODS.FER, PERIODS.VER],
		},
	]],
	['ESC_DOM', [
		{
			description: 'Domingos e feriados do período escolar',
			weekdays: [WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['ESC_DU', [
		{
			description: 'Dias úteis do período escolar',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['ESC_QUA', [
		{
			description: 'Quartas-feiras do período escolar',
			weekdays: [WEEKDAYS.Wed],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['ESC_QUI', [
		{
			description: 'Quintas-feiras do período escolar',
			weekdays: [WEEKDAYS.Thu],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['ESC_SAB', [
		{
			description: 'Sábados do período escolar',
			weekdays: [WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['ESC_SEG', [
		{
			description: 'Segundas-feiras do período escolar',
			weekdays: [WEEKDAYS.Mon],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['ESC_SEX', [
		{
			description: 'Sextas-feiras do período escolar',
			weekdays: [WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['ESC_TER', [
		{
			description: 'Terças-feiras do período escolar',
			weekdays: [WEEKDAYS.Tue],
			yearPeriodIds: [PERIODS.ESC],
		},
	]],
	['FER_DOM', [
		{
			description: 'Domingos e feriados do período de férias',
			weekdays: [WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['FER_DU', [
		{
			description: 'Dias úteis do período de férias',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['FER_QUA', [
		{
			description: 'Quartas-feiras do período de férias',
			weekdays: [WEEKDAYS.Wed],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['FER_QUI', [
		{
			description: 'Quintas-feiras do período de férias',
			weekdays: [WEEKDAYS.Thu],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['FER_SAB', [
		{
			description: 'Sábados do período de férias',
			weekdays: [WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['FER_SEG', [
		{
			description: 'Segundas-feiras do período de férias',
			weekdays: [WEEKDAYS.Mon],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['FER_SEX', [
		{
			description: 'Sextas-feiras do período de férias',
			weekdays: [WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['FER_TER', [
		{
			description: 'Terças-feiras do período de férias',
			weekdays: [WEEKDAYS.Tue],
			yearPeriodIds: [PERIODS.FER],
		},
	]],
	['VER_DOM', [
		{
			description: 'Domingos e feriados do período de verão',
			weekdays: [WEEKDAYS.Sun],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['VER_DU', [
		{
			description: 'Dias úteis do período de verão',
			weekdays: [WEEKDAYS.Mon, WEEKDAYS.Tue, WEEKDAYS.Wed, WEEKDAYS.Thu, WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['VER_QUA', [
		{
			description: 'Quartas-feiras do período de verão',
			weekdays: [WEEKDAYS.Wed],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['VER_QUI', [
		{
			description: 'Quintas-feiras do período de verão',
			weekdays: [WEEKDAYS.Thu],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['VER_SAB', [
		{
			description: 'Sábados do período de verão',
			weekdays: [WEEKDAYS.Sat],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['VER_SEG', [
		{
			description: 'Segundas-feiras do período de verão',
			weekdays: [WEEKDAYS.Mon],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['VER_SEX', [
		{
			description: 'Sextas-feiras do período de verão',
			weekdays: [WEEKDAYS.Fri],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
	['VER_TER', [
		{
			description: 'Terças-feiras do período de verão',
			weekdays: [WEEKDAYS.Tue],
			yearPeriodIds: [PERIODS.VER],
		},
	]],
]);
