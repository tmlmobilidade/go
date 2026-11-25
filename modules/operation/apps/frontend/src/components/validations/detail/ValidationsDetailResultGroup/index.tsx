'use client';

import { translateValidationResult } from '@/components/validations/detail/translate-validation-result';
import { ValidationsDetailResultMessages } from '@/components/validations/detail/ValidationsDetailResultMessages';
import { getGtfsScheduleDocUrl } from '@/lib/gtfs-schedule-doc-url';
import { IconChevronRight, IconExternalLink } from '@tabler/icons-react';
import { type GtfsValidationOutputResult } from '@tmlmobilidade/go-types-gtfs-validator';
import { SeverityTag } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface ValidationsDetailResultGroupProps {
	result: GtfsValidationOutputResult
}

/* * */

export function ValidationsDetailResultGroup({ result }: ValidationsDetailResultGroupProps) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [showAllMessages, setShowAllMessages] = useState(false);

	//
	// B. Transform data

	const documentationUrl = getGtfsScheduleDocUrl(result.rule_id);
	const rowsLabel = t('validations:detail.ValidationsDetailResultGroup.affected_rows', '', { count: result.total_rows });
	const description = translateValidationResult(i18n, 'description', result.rule_id, result.description_translation, result.description);

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
				<span className={styles.severity}><SeverityTag severity={result.severity} /></span>
				<span className={styles.ruleId}>{result.rule_id}</span>
				<span className={styles.headline}>{description}</span>
				<span className={styles.affectedRows}>{rowsLabel}</span>
			</button>
			{isOpen && (
				<div className={styles.detail}>
					<div className={styles.detailHeader}>
						{documentationUrl && (
							<a className={styles.link} href={documentationUrl} rel="noopener noreferrer" target="_blank">
								{t('validations:detail.ValidationsDetailResultGroup.documentation')} <IconExternalLink size={16} />
							</a>
						)}
					</div>
					{result.messages.length > 0 && (
						<ValidationsDetailResultMessages
							description={description}
							messages={result.messages}
							onShowAll={() => setShowAllMessages(true)}
							ruleId={result.rule_id}
							showAll={showAllMessages}
						/>
					)}
				</div>
			)}
		</div>
	);

	//
}
