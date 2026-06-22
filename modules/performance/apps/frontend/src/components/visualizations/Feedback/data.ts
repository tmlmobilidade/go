/* * */

import type { FeedbackTopicData } from './types';

/* * */

export const FEEDBACK_TOPIC_PLACEHOLDER_DATA: FeedbackTopicData = {
	categories: [
		{ id: 'line', label: 'Linha', skeletonWidth: '54%' },
		{ id: 'driver', label: 'Condutor', skeletonWidth: '54%' },
		{ id: 'vehicle', label: 'Veículo', skeletonWidth: '54%' },
		{ id: 'stop', label: 'Paragem', skeletonWidth: '54%' },
	],
	chartBars: [
		{ id: 'bar-1', skeletonHeight: '35%' },
		{ id: 'bar-2', skeletonHeight: '58%' },
		{ id: 'bar-3', skeletonHeight: '44%' },
		{ id: 'bar-4', skeletonHeight: '72%' },
		{ id: 'bar-5', skeletonHeight: '62%' },
		{ id: 'bar-6', skeletonHeight: '82%' },
	],
	summaryCards: [
		{ id: 'volume', label: '', skeletonWidth: '56%' },
		{ id: 'average-rating', label: 'Avaliação média', skeletonWidth: '42%' },
		{ id: 'response-time', label: '', skeletonWidth: '48%' },
	],
	topLines: [
		{ id: 'top-line-1' },
		{ id: 'top-line-2' },
		{ id: 'top-line-3' },
		{ id: 'top-line-4' },
	],
};

