'use client';

/* * */

import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, Modal, Section, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { useStopsEditorContext } from '../ShapeEditor.context';
import { ShapeEditorContent } from '../ShapeEditorContent';
import { ShapeEditorFooter } from '../ShapeEditorFooter';

/* * */

export function ShapeEditor() {
	//

	//
	// A. Setup variables

	const stopsEditorContext = useStopsEditorContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			{/* Main Content */}
			<div className={styles.mainContent}>
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
					closeOnClickOutside={false}
					closeOnEscape={false}
					onClose={() => stopsEditorContext.actions.dismissMigrationWarning()}
					opened={stopsEditorContext.flags.migrationWarningVisible}
					size="md"
					styles={{ inner: { alignItems: 'center' } }}
					title="Shape importado do GTFS"
				>
					<Section alignItems="center" gap="lg">
						<IconAlertTriangle color="var(--color-status-warning-primary)" size={40} />
						<Section gap="sm" padding="none">
							<Text>
								Este percurso foi importado diretamente do GTFS e não contém informação
								de pontos intermédios calculados pela nossa plataforma.
							</Text>
							<Text>
								Para poder editar paragens e desvios, é necessário converter a shape
								para o formato editável, recalculando o percurso.
							</Text>
							<Text weight="semibold">
								O trajeto resultante pode diferir ligeiramente do original.
							</Text>
							<Text>
								Esta conversão fica registada no histórico e pode ser revertida.
							</Text>
						</Section>
						<Section flexDirection="row" gap="sm" justifyContent="center" padding="none">
							<Button
								label="Dispensar"
								onClick={() => stopsEditorContext.actions.dismissMigrationWarning()}
								variant="secondary"
							/>
							<Button
								label="Converter e editar"
								loading={stopsEditorContext.flags.isLoadingRoute}
								onClick={() => void stopsEditorContext.actions.convertShapeToEditable()}
							/>
						</Section>
					</Section>
				</Modal>
			</div>
		</div>
	);
}
