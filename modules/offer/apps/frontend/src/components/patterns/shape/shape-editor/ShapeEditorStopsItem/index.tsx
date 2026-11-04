'use client';

/* * */

import { IconArrowBarToDown, IconArrowBarUp, IconClock } from '@tabler/icons-react';
import { PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { DeleteButton, Section, Tag, Text } from '@tmlmobilidade/ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useShapeEditorContext } from '../ShapeEditor.context';

/* * */

export function ShapeEditorStopsItem({ pathItem, rowIndex }: { pathItem: PatternsDetailPathItem, rowIndex: number }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const shapeEditorContext = useShapeEditorContext();

	const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const [isExpanded, setIsExpanded] = useState(false);

	const stopItem = shapeEditorContext.data.path[rowIndex];

	const stopLocationInfo = useMemo(() => {
		const location = pathItem.stop?.location;
		if (!location) return null;
		const { neighbourhood, secondary } = location;
		return neighbourhood && neighbourhood.name !== secondary.name ? `${neighbourhood.name}, ${secondary.name}` : secondary.name;
	}, [pathItem.stop?.location]);

	//
	// B. Handle actions

	const handleDelete = () => {
		shapeEditorContext.actions.removeStop(rowIndex);
	};

	const handleToogle = (field: 'allow_drop_off' | 'allow_pickup' | 'timepoint') => {
		const currentValue = stopItem ? stopItem[field] : undefined;
		if (currentValue === undefined) return;

		shapeEditorContext.actions.updateStop(rowIndex, { [field]: !currentValue });
	};

	const clearEnterTimeout = () => {
		if (enterTimeoutRef.current) {
			clearTimeout(enterTimeoutRef.current);
			enterTimeoutRef.current = null;
		}
	};

	const clearExitTimeout = () => {
		if (exitTimeoutRef.current) {
			clearTimeout(exitTimeoutRef.current);
			exitTimeoutRef.current = null;
		}
	};

	const handleMouseEnter = () => {
		clearExitTimeout();

		enterTimeoutRef.current = setTimeout(() => {
			setIsExpanded(true);
			enterTimeoutRef.current = null;
		}, 100);
	};

	const handleMouseLeave = () => {
		clearEnterTimeout();

		exitTimeoutRef.current = setTimeout(() => {
			setIsExpanded(false);
			exitTimeoutRef.current = null;
		}, 100);
	};

	//
	// C. Render components

	return (
		<div
			className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<Section gap="md" padding="none">
				<div className={styles.stopInfo}>
					<Text maw="90%" weight="semibold">
						{rowIndex + 1}. {pathItem.stop?.name ?? `Paragem ${pathItem.stop_id}`}
					</Text>

					<div className={styles.details}>
						<div className={styles.detailsInner}>
							<Text c="var(--color-system-text-200)" size="sm">
								{stopLocationInfo ? `${stopLocationInfo} | ` : ''}#{pathItem.stop?._id ?? pathItem.stop_id}
							</Text>

							<Section flexDirection="row" gap="sm" padding="none">
								<Tag icon={<IconClock />} onClick={() => handleToogle('timepoint')} tooltip={t(stopItem?.timepoint ? 'patterns:shape.ShapeEditorStopsItem.timepoint_yes' : 'patterns:shape.ShapeEditorStopsItem.timepoint_no')} variant={stopItem?.timepoint ? 'muted' : 'danger'} />
								<Tag icon={<IconArrowBarToDown />} onClick={() => handleToogle('allow_pickup')} tooltip={t(stopItem?.allow_pickup ? 'patterns:shape.ShapeEditorStopsItem.pickup_yes' : 'patterns:shape.ShapeEditorStopsItem.pickup_no')} variant={stopItem?.allow_pickup ? 'muted' : 'danger'} />
								<Tag icon={<IconArrowBarUp />} onClick={() => handleToogle('allow_drop_off')} tooltip={t(stopItem?.allow_drop_off ? 'patterns:shape.ShapeEditorStopsItem.drop_off_yes' : 'patterns:shape.ShapeEditorStopsItem.drop_off_no')} variant={stopItem?.allow_drop_off ? 'muted' : 'danger'} />
							</Section>
						</div>
					</div>
				</div>
			</Section>

			{isExpanded && (
				<div className={styles.menuButton}>
					<DeleteButton onDelete={handleDelete} />
				</div>
			)}
		</div>
	);
}
