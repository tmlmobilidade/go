'use client';

import { IconChevronRight, IconExternalLink } from '@tabler/icons-react';
import { type GtfsValidationOutputMessage, type GtfsValidationOutputRuleMessage } from '@tmlmobilidade/go-types-gtfs-validator';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { SeverityTag } from '../../tags/SeverityTag';
import { GtfsValidationResultRows } from '../GtfsValidationResultRows';

/* * */

export interface GtfsValidationResultGroupProps {
	getRuleDocumentationUrl: (ruleId: string) => null | string
	group: GtfsValidationOutputRuleMessage
}

/* * */

/**
 * How many occurrences are rendered before the list is capped.
 * A single rule can report hundreds of them, and the remainder is one click away.
 */
const VISIBLE_OCCURRENCES_LIMIT = 10;

/* * */

export function GtfsValidationResultGroup({ getRuleDocumentationUrl, group }: GtfsValidationResultGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [showAllOccurrences, setShowAllOccurrences] = useState(false);

	//
	// B. Transform data

	const occurrencesLabel = t('shared:components.gtfsValidationResultGroup.occurrences', '', { count: group.total_rows });

	const documentationUrl = getRuleDocumentationUrl(group.rule_id);

	// Validations stored before the summary was grouped carry no nested messages,
	// so the group itself stands in as the single occurrence
	const occurrences: GtfsValidationOutputMessage[] = useMemo(() => {
		if (group.messages.length > 0) return group.messages;
		return [{ field: group.field, file_name: group.file_name, message: group.message, rows: group.rows ?? [], rule_id: group.rule_id, severity: group.severity }];
	}, [group]);

	const visibleOccurrences = showAllOccurrences ? occurrences : occurrences.slice(0, VISIBLE_OCCURRENCES_LIMIT);
	const hiddenOccurrencesCount = occurrences.length - visibleOccurrences.length;

	//
	// C. Render components

	return (
		<div className={styles.group}>
			<button
				aria-expanded={isOpen}
				className={styles.header}
				onClick={() => setIsOpen(previous => !previous)}
				type="button"
			>
				<IconChevronRight className={styles.chevron} data-open={isOpen} size={16} />
				<span className={styles.metadata}>
					<span className={styles.fileName}>{group.file_name}</span>
					<span className={styles.field}>{group.field}</span>
				</span>
				<div className={styles.severity}><SeverityTag severity={group.severity} /></div>
				<span className={styles.headline}>{group.message}</span>
				<span className={styles.occurrences}>{occurrencesLabel}</span>
			</button>
			{isOpen && (
				<div className={styles.detail}>
					<div className={styles.detailHeader}>
						<span className={styles.ruleId}>{group.rule_id}</span>
						{documentationUrl && (
							<a className={styles.link} href={documentationUrl} rel="noopener noreferrer" target="_blank">
								{t('shared:components.gtfsValidationResultGroup.learnMore')} <IconExternalLink size={12} />
							</a>
						)}
					</div>
					<ol className={styles.occurrenceList}>
						{visibleOccurrences.map((occurrence, index) => (
							<li key={`${occurrence.rule_id}::${index}`} className={styles.occurrence}>
								{occurrences.length > 1 && <span className={styles.occurrenceIndex}>{index + 1}</span>}
								<div className={styles.occurrenceBody}>
									<p className={styles.occurrenceMessage}>{occurrence.message}</p>
									{(occurrence.severity !== group.severity || occurrence.rows.length > 0) && (
										<div className={styles.occurrenceFooter}>
											{occurrence.severity !== group.severity && <SeverityTag severity={occurrence.severity} />}
											{occurrence.rows.length > 0 && (
												<>
													<span className={styles.occurrenceRowsLabel}>{t('shared:components.gtfsValidationResultGroup.rows')}</span>
													<GtfsValidationResultRows limit={10} rows={occurrence.rows} />
												</>
											)}
										</div>
									)}
								</div>
							</li>
						))}
					</ol>
					{hiddenOccurrencesCount > 0 && (
						<button className={styles.showAll} onClick={() => setShowAllOccurrences(true)} type="button">
							{t('shared:components.gtfsValidationResultGroup.showAll', '', { count: hiddenOccurrencesCount })}
						</button>
					)}
				</div>
			)}
		</div>
	);

	//
}
