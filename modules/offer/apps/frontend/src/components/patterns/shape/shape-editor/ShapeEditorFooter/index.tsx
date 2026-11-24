'use client';

/* * */

import { IconArrowBackUp, IconArrowForwardUp, IconDeviceFloppy, IconRoute } from '@tabler/icons-react';
import { Button, IconButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useShapeEditorContext } from '../ShapeEditor.context';

/* * */

export function ShapeEditorFooter() {
	//

	//
	// A. Setup variables

	const shapeEditorContext = useShapeEditorContext();
	const { t } = useTranslation();

	//
	// B. Handle actions

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Toolbar>
				<Button
					disabled={!shapeEditorContext.flags.canRecalculate}
					icon={<IconRoute />}
					label={t('default:patterns.shapeEditor.recalculate')}
					onClick={shapeEditorContext.actions.requestRecalculation}
				/>

				<IconButton
					icon={<IconArrowBackUp size={18} />}
					isDisabled={!shapeEditorContext.flags.canUndo}
					onClick={() => shapeEditorContext.actions.undo()}
					tooltip={t('default:patterns.shapeEditor.undo')}
					variant="primary"
				/>

				<IconButton
					icon={<IconArrowForwardUp size={18} />}
					isDisabled={!shapeEditorContext.flags.canRedo}
					onClick={() => shapeEditorContext.actions.redo()}
					tooltip={t('default:patterns.shapeEditor.redo')}
					variant="primary"
				/>

				<Spacer />

				<Button
					label={t('default:patterns.shapeEditor.cancel')}
					onClick={() => shapeEditorContext.actions.cancel()}
					variant="danger"
				/>

				<Button
					disabled={!shapeEditorContext.flags.canSubmit}
					icon={<IconDeviceFloppy />}
					label={t('default:patterns.shapeEditor.apply')}
					onClick={() => shapeEditorContext.actions.submit()}
				/>
			</Toolbar>
		</div>
	);

	//
}
