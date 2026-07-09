'use client';

import type { PublicFeedback } from '@tmlmobilidade/go-types-performance';
import type { Agency } from '@tmlmobilidade/types';
import type { PropsWithChildren } from 'react';

import { useFeedbackEntityDetailModalContext } from '@/contexts/feedback/FeedbackEntityDetailModal.context';
import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { getFeedbackLineContributionMeters } from '@/utils/feedback/feedback-line-contributions';
import { buildLineLabelsById, type FeedbackNetworkLine, getLineLabel } from '@/utils/feedback/network-labels';
import { getOperatorName } from '@/utils/feedback/operators';
import { type FeedbackEntityMetrics, getFeedbackEntitySummary, getFeedbackMetricsByEntity } from '@/utils/metrics/feedback-metrics';
import { useDebouncedValue } from '@tmlmobilidade/ui';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export type FeedbackLineSortMode = 'feedback_count_desc' | 'satisfaction_asc' | 'satisfaction_desc';
export type FeedbackLineViewItem = FeedbackEntityMetrics;

const LINE_SEARCH_DEBOUNCE_MS = 500;

const FEEDBACK_LINE_SORT_OPTIONS: { label: string, value: FeedbackLineSortMode }[] = [
	{ label: 'Feedbacks', value: 'feedback_count_desc' },
	{ label: 'Maior índice', value: 'satisfaction_desc' },
	{ label: 'Menor índice', value: 'satisfaction_asc' },
];

/* * */

interface FeedbackLinesViewContextState {
	actions: {
		openLineDetail: (line: FeedbackLineViewItem) => void
		setLineSearchValue: (value: string) => void
		setLineSortMode: (value: FeedbackLineSortMode) => void
	}
	data: {
		lines: FeedbackLineViewItem[]
		linesById: Map<string, string>
		lineSearchValue: string
		lineSortMode: FeedbackLineSortMode
		operatorFilter: ReturnType<typeof useFeedbackOperatorFilter>
		sortOptions: typeof FEEDBACK_LINE_SORT_OPTIONS
	}
	flags: {
		error?: Error
		isLoading: boolean
	}
}

/* * */

const FeedbackLinesViewContext = createContext<FeedbackLinesViewContextState | undefined>(undefined);

export function useFeedbackLinesViewContext() {
	const context = useContext(FeedbackLinesViewContext);
	if (!context) {
		throw new Error('useFeedbackLinesViewContext must be used within a FeedbackLinesViewContextProvider');
	}

	return context;
}

/* * */

function normalizeSearchValue(value: string) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase('pt-PT')
		.trim();
}

function matchesSearch(fields: (string | undefined)[], searchValue: string) {
	if (!searchValue) return true;
	return fields.some(field => normalizeSearchValue(field ?? '').includes(searchValue));
}

function getOperatorLabel(operatorId: string, operatorsById: Map<string, Agency>) {
	const operator = operatorsById.get(operatorId);
	if (!operator) return operatorId;

	return getOperatorName(operator);
}

function sortLines(lines: FeedbackLineViewItem[], sortMode: FeedbackLineSortMode, linesById: Map<string, string>) {
	return [...lines].sort((lineA, lineB) => {
		const feedbackCountDiff = lineB.feedbackCount - lineA.feedbackCount;
		const labelDiff = getLineLabel(lineA.entityId, linesById).localeCompare(getLineLabel(lineB.entityId, linesById), 'pt-PT');
		const satisfactionDiff = lineA.satisfactionIndex - lineB.satisfactionIndex;

		if (sortMode === 'feedback_count_desc') return feedbackCountDiff || labelDiff;
		if (sortMode === 'satisfaction_asc') return satisfactionDiff || feedbackCountDiff || labelDiff;
		return (satisfactionDiff * -1) || feedbackCountDiff || labelDiff;
	});
}

/* * */

export function FeedbackLinesViewContextProvider({ children }: PropsWithChildren) {
	//
	// A. Setup state

	const [lineSortMode, setLineSortMode] = useState<FeedbackLineSortMode>('feedback_count_desc');
	const [lineSearchValue, setLineSearchValue] = useState('');
	const modalContext = useFeedbackEntityDetailModalContext();

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: linesData } = useSWR<FeedbackNetworkLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });

	//
	// C. Transform data

	const operatorFilter = useFeedbackOperatorFilter(data, 'line');

	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const lineMetrics = useMemo(() => getFeedbackMetricsByEntity(operatorFilter.rows, 'line'), [operatorFilter.rows]);
	const [debouncedLineSearchValue] = useDebouncedValue(lineSearchValue, LINE_SEARCH_DEBOUNCE_MS);
	const normalizedLineSearchValue = useMemo(() => normalizeSearchValue(debouncedLineSearchValue), [debouncedLineSearchValue]);
	const lines = useMemo(() => {
		return sortLines(lineMetrics, lineSortMode, linesById)
			.filter(line => matchesSearch([
				line.entityId,
				getLineLabel(line.entityId, linesById),
				line.operatorId,
				line.operatorId ? getOperatorLabel(line.operatorId, operatorFilter.operatorsById) : undefined,
			], normalizedLineSearchValue));
	}, [lineMetrics, lineSortMode, linesById, normalizedLineSearchValue, operatorFilter.operatorsById]);

	//
	// D. Handle actions

	const openLineDetail = (line: FeedbackLineViewItem) => {
		modalContext.actions.open(getFeedbackEntitySummary(line, 'line', linesById, getFeedbackLineContributionMeters(operatorFilter.rows, line)));
	};

	//
	// E. Define context value

	const contextValue: FeedbackLinesViewContextState = {
		actions: {
			openLineDetail,
			setLineSearchValue,
			setLineSortMode,
		},
		data: {
			lines,
			linesById,
			lineSearchValue,
			lineSortMode,
			operatorFilter,
			sortOptions: FEEDBACK_LINE_SORT_OPTIONS,
		},
		flags: {
			error,
			isLoading,
		},
	};

	//
	// F. Render provider

	return (
		<FeedbackLinesViewContext.Provider value={contextValue}>
			{children}
		</FeedbackLinesViewContext.Provider>
	);
}
