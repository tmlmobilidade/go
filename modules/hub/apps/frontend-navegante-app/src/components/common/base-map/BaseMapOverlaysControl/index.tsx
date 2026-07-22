'use client';

import { BaseMapFiltersSheet } from '@/components/common/base-map/BaseMapFiltersSheet';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useMapFloatingControlsLayout } from '@/hooks/useMapFloatingControlsLayout';
import { IconStack2 } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface BaseMapOverlaysControlProps {
	onOpenedChange: (opened: boolean) => void
	opened: boolean
}

/* * */

export function BaseMapOverlaysControl({ onOpenedChange, opened }: BaseMapOverlaysControlProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const controlsLayout = useMapFloatingControlsLayout();

	//
	// B. Setup effects

	useEffect(() => {
		if (controlsLayout.layout === 'hidden') onOpenedChange(false);
	}, [controlsLayout.layout, onOpenedChange]);

	useEffect(() => {
		if (!opened) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onOpenedChange(false);
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onOpenedChange, opened]);

	//
	// C. Render components

	return (
		<>
			<div className={styles.container} data-layout={controlsLayout.layout}>
				<button
					aria-expanded={opened}
					aria-label={t('default:map.BaseMapOverlaysControl.trigger.label')}
					className={styles.trigger}
					data-open={opened}
					onClick={() => onOpenedChange(true)}
					type="button"
				>
					<IconStack2 size={24} />
				</button>
			</div>

			<BottomSheet
				onClose={() => onOpenedChange(false)}
				opened={opened}
				size="fit"
				syncSnapState={false}
				title={t('default:map.BaseMapOverlaysControl.title')}
			>
				<BaseMapFiltersSheet />
			</BottomSheet>
		</>
	);

	//
}
