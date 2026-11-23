'use client';

/* * */

import { IconAlertTriangle } from '@tabler/icons-react';
import { AlertMessage, Button, Modal, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useShapeEditorContext } from '../ShapeEditor.context';
import { ShapeEditorContent } from '../ShapeEditorContent';
import { ShapeEditorFooter } from '../ShapeEditorFooter';

/* * */

export function ShapeEditor() {
	//

	//
	// A. Setup variables

	const shapeEditorContext = useShapeEditorContext();
	const { t } = useTranslation();
	const anchorIssues = shapeEditorContext.data.anchorIssues;
	const anchorIssuesLabel = anchorIssues.map((issue) => {
		const segments = issue.candidates.map(candidate => `${candidate.afterIndex + 1}→${candidate.beforeIndex + 1} (${candidate.afterStopId}→${candidate.beforeStopId})`).join(', ');
		return `${issue.anchorId}: ${segments || t('default:patterns.shapeEditor.missingSegment')}`;
	}).join('; ');

	//
	// B. Render components

	return (
		<div className={styles.container}>

			{/* Main Content */}
			<div className={styles.mainContent}>
				{anchorIssues.length > 0 && (
					<Section gap="sm" padding="none">
						<AlertMessage title={t('default:patterns.shapeEditor.anchorIssuesTitle')} />
						<Text>{anchorIssuesLabel}</Text>
					</Section>
				)}
				{/* Header */}
				<div className={styles.header} />

				{/* Scrollable Content */}
				<div className={styles.content}>
					<ShapeEditorContent />
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<ShapeEditorFooter />
				</div>

				{/* Migration Warning Modal */}
				<Modal
					classNames={{ inner: styles.migrationModalInner }}
					closeOnClickOutside={false}
					closeOnEscape={false}
					onClose={() => shapeEditorContext.actions.dismissMigrationWarning()}
					opened={shapeEditorContext.flags.migrationWarningVisible}
					size="md"
					title={anchorIssues.length ? t('default:patterns.shapeEditor.anchorIssuesTitle') : t('default:patterns.shapeEditor.importedTitle')}
				>
					<Section alignItems="center" gap="lg">
						<IconAlertTriangle color="var(--color-status-warning-primary)" size={40} />
						<Section gap="sm" padding="none">
							{anchorIssues.length > 0 ? (
								<Text>{t('default:patterns.shapeEditor.anchorIssuesDescription')}</Text>
							) : (
								<>
									<Text>{t('default:patterns.shapeEditor.importedDescription')}</Text>
									<Text>{t('default:patterns.shapeEditor.convertDescription')}</Text>
									<Text weight="semibold">{t('default:patterns.shapeEditor.conversionWarning')}</Text>
									<Text>{t('default:patterns.shapeEditor.conversionHistory')}</Text>
								</>
							)}
						</Section>
						<Section flexDirection="row" gap="sm" justifyContent="center" padding="none">
							<Button
								label={t('default:patterns.shapeEditor.dismiss')}
								onClick={() => shapeEditorContext.actions.dismissMigrationWarning()}
								variant="secondary"
							/>
							<Button
								label={t('default:patterns.shapeEditor.convert')}
								loading={shapeEditorContext.flags.isLoadingRoute}
								onClick={() => void shapeEditorContext.actions.convertShapeToEditable()}
							/>
						</Section>
					</Section>
				</Modal>
			</div>
		</div>
	);
}
