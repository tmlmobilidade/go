'use client';

import { ValidationsDetailResultMessages } from '@/components/validations/detail/ValidationsDetailResultMessages';
import { useValidationsDetailResultsContext } from '@/components/validations/detail/ValidationsDetailResults.context';
import { getGtfsScheduleDocUrl } from '@/lib/gtfs-schedule-doc-url';
import { IconExternalLink } from '@tabler/icons-react';
import { Button, Label, Pane, Section, SeverityTag, Text, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ValidationsDetailSelectedRule() {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const { data: { selected } } = useValidationsDetailResultsContext();
	const title = t('gtfs_validations:detail.ValidationsDetailSelectedRule.title');
	const documentationUrl = getGtfsScheduleDocUrl(selected?.ruleId);

	//
	// B. Render components

	return (
		<section key={selected?.id} aria-label={title} className={styles.pane}>
			<Pane header={[
				<Section key="header" alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm" justifyContent="space-between" padding="sm">
					<Label>{title}</Label>
					{documentationUrl && (
						<Button
							className={styles.documentation}
							classNames={{ label: styles.documentationLabel }}
							href={documentationUrl}
							label={t('gtfs_validations:detail.ValidationsDetailSelectedRule.documentation')}
							rightSection={<IconExternalLink size={18} aria-hidden />}
							target="_blank"
							variant="primary"
						/>
					)}
				</Section>,
			]}
			>
				{selected && (
					<Section gap="sm">
						<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm" padding="none">
							<SeverityTag severity={selected.result.severity} />
							<code className={styles.ruleId}>{selected.ruleId}</code>
						</Section>
						<Text className={styles.description}>{selected.description}</Text>
						<ValueDisplay
							label={t('gtfs_validations:detail.ValidationsDetailSelectedRule.affected_rows')}
							padding="none"
							value={selected.result.total_rows.toLocaleString(i18n.resolvedLanguage)}
							variant="transparent"
							strong
						/>
						<ValidationsDetailResultMessages
							description={selected.description}
							messages={selected.result.messages}
							ruleId={selected.ruleId}
						/>
					</Section>
				)}
			</Pane>
		</section>
	);

	//
}
