'use client';

import { type BaseMapOverlayType, useMapContext } from '@/components/map/Map.context';
import { useMapFloatingControlsLayout } from '@/hooks/useMapFloatingControlsLayout';
import { useClickOutside } from '@mantine/hooks';
import { IconAlertTriangle, IconBus, IconFlag2, IconStack2 } from '@tabler/icons-react';
import { type KeyboardEvent, type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface BaseMapOverlayControlItem {
	icon: ReactNode
	label: string
	value: BaseMapOverlayType
}

/* * */

export function BaseMapOverlaysControl() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isOpen, setIsOpen] = useState(false);
	const panelId = useId();
	const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

	const controlsLayout = useMapFloatingControlsLayout();

	const { actions: { toggleBaseMapOverlay }, data: { activeBaseMapOverlays } } = useMapContext();

	const controlItems: BaseMapOverlayControlItem[] = [
		{
			icon: <IconBus size={22} />,
			label: t('default:map.BaseMapOverlaysControl.layers.vehicles'),
			value: 'vehicles',
		},
		{
			icon: <IconFlag2 size={22} />,
			label: t('default:map.BaseMapOverlaysControl.layers.stops'),
			value: 'stops',
		},
		{
			icon: <IconAlertTriangle size={22} />,
			label: t('default:map.BaseMapOverlaysControl.layers.alerts'),
			value: 'alerts',
		},
	];

	//
	// B. Handle actions

	const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== 'Escape') return;
		setIsOpen(false);
	};

	//
	// C. Render components

	return (
		<div ref={containerRef} className={styles.container} data-layout={controlsLayout.layout} onKeyDown={handleContainerKeyDown}>

			<button
				aria-controls={panelId}
				aria-expanded={isOpen}
				aria-label={t('default:map.BaseMapOverlaysControl.trigger.label')}
				className={styles.trigger}
				data-open={isOpen}
				onClick={() => setIsOpen(prev => !prev)}
				type="button"
			>
				<IconStack2 size={24} />
			</button>

			{isOpen && (
				<div
					aria-label={t('default:map.BaseMapOverlaysControl.trigger.label')}
					className={styles.panel}
					id={panelId}
					role="group"
				>
					{controlItems.map((item) => {
						const isActive = activeBaseMapOverlays.includes(item.value);

						return (
							<button
								key={item.value}
								aria-label={item.label}
								aria-pressed={isActive}
								className={styles.layerButton}
								data-active={isActive}
								onClick={() => toggleBaseMapOverlay(item.value)}
								type="button"
							>
								<span className={styles.layerIcon}>{item.icon}</span>
							</button>
						);
					})}
				</div>
			)}

		</div>
	);
}
