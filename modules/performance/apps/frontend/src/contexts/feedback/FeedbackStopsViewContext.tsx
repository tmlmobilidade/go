'use client';

import type { PublicFeedback } from '@tmlmobilidade/types';
import type { PropsWithChildren } from 'react';

import { useFeedbackEntityDetailModalContext } from '@/contexts/feedback/FeedbackEntityDetailModal.context';
import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { getFeedbackStopReasonMeters } from '@/utils/feedback/feedback-stop-reasons';
import { buildStopLabelsById, type FeedbackNetworkStop, getStopLabel } from '@/utils/feedback/network-labels';
import { type FeedbackEntityMetrics, getFeedbackEntitySummary, getFeedbackMetricsByEntity } from '@/utils/metrics/feedback-metrics';
import { useDebouncedValue } from '@tmlmobilidade/ui';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export type FeedbackStopSortMode = 'feedback_count_desc' | 'satisfaction_asc' | 'satisfaction_desc';
export type FeedbackStopViewItem = FeedbackEntityMetrics;

const STOP_SEARCH_DEBOUNCE_MS = 800;

const FEEDBACK_STOP_SORT_OPTIONS: { label: string, value: FeedbackStopSortMode }[] = [
	{ label: 'Feedbacks', value: 'feedback_count_desc' },
	{ label: 'Maior índice', value: 'satisfaction_desc' },
	{ label: 'Menor índice', value: 'satisfaction_asc' },
];

/* * */

interface FeedbackStopsViewContextState {
	actions: {
		openStopDetail: (stop: FeedbackStopViewItem) => void
		setStopSearchValue: (value: string) => void
		setStopSortMode: (value: FeedbackStopSortMode) => void
	}
	data: {
		operatorFilter: ReturnType<typeof useFeedbackOperatorFilter>
		sortOptions: typeof FEEDBACK_STOP_SORT_OPTIONS
		stops: FeedbackStopViewItem[]
		stopsById: Map<string, string>
		stopSearchValue: string
		stopSortMode: FeedbackStopSortMode
	}
	flags: {
		error?: Error
		isLoading: boolean
	}
}

/* * */

const FeedbackStopsViewContext = createContext<FeedbackStopsViewContextState | undefined>(undefined);

export function useFeedbackStopsViewContext() {
	const context = useContext(FeedbackStopsViewContext);
	if (!context) {
		throw new Error('useFeedbackStopsViewContext must be used within a FeedbackStopsViewContextProvider');
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

function sortStops(stops: FeedbackStopViewItem[], sortMode: FeedbackStopSortMode, stopsById: Map<string, string>) {
	return [...stops].sort((stopA, stopB) => {
		const feedbackCountDiff = stopB.feedbackCount - stopA.feedbackCount;
		const labelDiff = getStopLabel(stopA.entityId, stopsById).localeCompare(getStopLabel(stopB.entityId, stopsById), 'pt-PT');
		const satisfactionDiff = stopA.satisfactionIndex - stopB.satisfactionIndex;

		if (sortMode === 'feedback_count_desc') return feedbackCountDiff || labelDiff;
		if (sortMode === 'satisfaction_asc') return satisfactionDiff || feedbackCountDiff || labelDiff;
		return (satisfactionDiff * -1) || feedbackCountDiff || labelDiff;
	});
}

/* * */

export function FeedbackStopsViewContextProvider({ children }: PropsWithChildren) {
	//
	// A. Setup state

	const [stopSortMode, setStopSortMode] = useState<FeedbackStopSortMode>('feedback_count_desc');
	const [stopSearchValue, setStopSearchValue] = useState('');
	const modalContext = useFeedbackEntityDetailModalContext();

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<PublicFeedback[], Error>(Routes.FEEDBACK_PREVIEW);
	const { data: stopsData } = useSWR<FeedbackNetworkStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });

	//
	// C. Transform data

	const operatorFilter = useFeedbackOperatorFilter(data, 'stop');

	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const stopMetrics = useMemo(() => getFeedbackMetricsByEntity(operatorFilter.rows, 'stop'), [operatorFilter.rows]);
	const [debouncedStopSearchValue] = useDebouncedValue(stopSearchValue, STOP_SEARCH_DEBOUNCE_MS);
	const normalizedStopSearchValue = useMemo(() => normalizeSearchValue(debouncedStopSearchValue), [debouncedStopSearchValue]);
	const stops = useMemo(() => {
		return sortStops(stopMetrics, stopSortMode, stopsById)
			.filter(stop => matchesSearch([
				stop.entityId,
				getStopLabel(stop.entityId, stopsById),
			], normalizedStopSearchValue));
	}, [stopMetrics, stopSortMode, stopsById, normalizedStopSearchValue]);

	//
	// D. Handle actions

	const openStopDetail = (stop: FeedbackStopViewItem) => {
		modalContext.actions.open(getFeedbackEntitySummary(stop, 'stop', stopsById, undefined, getFeedbackStopReasonMeters(operatorFilter.rows, stop)));
	};

	//
	// E. Define context value

	const contextValue: FeedbackStopsViewContextState = {
		actions: {
			openStopDetail,
			setStopSearchValue,
			setStopSortMode,
		},
		data: {
			operatorFilter,
			sortOptions: FEEDBACK_STOP_SORT_OPTIONS,
			stops,
			stopsById,
			stopSearchValue,
			stopSortMode,
		},
		flags: {
			error,
			isLoading,
		},
	};

	//
	// F. Render provider

	return (
		<FeedbackStopsViewContext.Provider value={contextValue}>
			{children}
		</FeedbackStopsViewContext.Provider>
	);
}
