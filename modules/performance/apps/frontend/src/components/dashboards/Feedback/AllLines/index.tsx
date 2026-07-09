/* * */

'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal } from '@/components/visualizations/Feedback';
import { FeedbackEntitiesTable } from '@/components/visualizations/FeedbackEntitiesTable';
import { FeedbackEntityDetailModalContextProvider } from '@/contexts/feedback/FeedbackEntityDetailModal.context';
import { FeedbackLinesViewContextProvider, useFeedbackLinesViewContext } from '@/contexts/feedback/FeedbackLinesViewContext';
import { getLineLabel } from '@/utils/feedback/network-labels';
import { SearchInput, SegmentedControl } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

function FeedbackLinesView() {
	//
	// A. Setup variables

	const viewContext = useFeedbackLinesViewContext();
	const { lines, linesById, lineSearchValue, lineSortMode, sortOptions } = viewContext.data;
	const { error, isLoading } = viewContext.flags;

	//
	// B. Render components

	return (
		<>
			<div className={styles.dashboardContent}>
				<div className={styles.pageFilters}>
					<div className={styles.searchInput}>
						<SearchInput onChange={viewContext.actions.setLineSearchValue} value={lineSearchValue} />
					</div>
				</div>

				<ContainerWrapper className={styles.container} padding="0">
					<div className={styles.header}>
						<h2 className={styles.title}>Todas as linhas</h2>

						<div className={styles.headerControls}>
							<div className={styles.sortControl}>
								<h3 className={styles.controlLabel}>Ordenar</h3>
								<SegmentedControl data={sortOptions} onChange={viewContext.actions.setLineSortMode} value={lineSortMode} />
							</div>
						</div>
					</div>

					<div className={styles.content}>
						{isLoading && <p className={styles.text}>A carregar linhas...</p>}
						{error && <p className={styles.text}>Erro ao carregar linhas.</p>}
						{!isLoading && !error && lines.length === 0 && <p className={styles.text}>Sem linhas para mostrar.</p>}

						{!isLoading && !error && lines.length > 0 && (
							<FeedbackEntitiesTable
								entityColumnLabel="Linha"
								entityTypeLabel="linha"
								getEntityLabel={entityId => getLineLabel(entityId, linesById)}
								items={lines}
								onOpenEntity={viewContext.actions.openLineDetail}
								showOperatorColumn
							/>
						)}
					</div>
				</ContainerWrapper>
			</div>

			<FeedbackEntityDetailModal />
		</>
	);
}

export function FeedbackLines() {
	return (
		<FeedbackEntityDetailModalContextProvider>
			<FeedbackLinesViewContextProvider>
				<FeedbackLinesView />
			</FeedbackLinesViewContextProvider>
		</FeedbackEntityDetailModalContextProvider>
	);
}
