/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal } from '@/components/visualizations/Feedback';
import { FeedbackEntitiesTable } from '@/components/visualizations/FeedbackEntitiesTable';
import { FeedbackEntityDetailModalContextProvider } from '@/contexts/feedback/FeedbackEntityDetailModal.context';
import { FeedbackStopsViewContextProvider, useFeedbackStopsViewContext } from '@/contexts/feedback/FeedbackStopsViewContext';
import { getStopLabel } from '@/utils/feedback/network-labels';
import { SearchInput, SegmentedControl } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

function FeedbackStopsView() {
	//
	// A. Setup variables

	const viewContext = useFeedbackStopsViewContext();
	const { sortOptions, stops, stopsById, stopSearchValue, stopSortMode } = viewContext.data;
	const { error, isLoading } = viewContext.flags;

	//
	// B. Render components

	return (
		<>
			<div className={styles.dashboardContent}>
				<div className={styles.pageFilters}>
					<div className={styles.searchInput}>
						<SearchInput onChange={viewContext.actions.setStopSearchValue} value={stopSearchValue} />
					</div>
				</div>

				<ContainerWrapper className={styles.container} padding="0">
					<div className={styles.header}>
						<h2 className={styles.title}>Todas as paragens</h2>

						<div className={styles.headerControls}>
							<div className={styles.sortControl}>
								<h3 className={styles.controlLabel}>Ordenar</h3>
								<SegmentedControl data={sortOptions} onChange={viewContext.actions.setStopSortMode} value={stopSortMode} />
							</div>
						</div>
					</div>

					<div className={styles.content}>
						{isLoading && <p className={styles.text}>A carregar paragens...</p>}
						{error && <p className={styles.text}>Erro ao carregar paragens.</p>}
						{!isLoading && !error && stops.length === 0 && <p className={styles.text}>Sem paragens para mostrar.</p>}

						{!isLoading && !error && stops.length > 0 && (
							<FeedbackEntitiesTable
								entityColumnLabel="Paragem"
								entityTypeLabel="paragem"
								getEntityLabel={entityId => getStopLabel(entityId, stopsById)}
								items={stops}
								onOpenEntity={viewContext.actions.openStopDetail}
							/>
						)}
					</div>
				</ContainerWrapper>
			</div>

			<FeedbackEntityDetailModal />
		</>
	);
}

export function FeedbackStops() {
	return (
		<FeedbackEntityDetailModalContextProvider>
			<FeedbackStopsViewContextProvider>
				<FeedbackStopsView />
			</FeedbackStopsViewContextProvider>
		</FeedbackEntityDetailModalContextProvider>
	);
}
