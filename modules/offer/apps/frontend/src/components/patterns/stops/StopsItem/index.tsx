'use client';

/* * */

import { IconArrowBarToDown, IconArrowBarUp, IconClock, IconClockPause, IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { Path } from '@tmlmobilidade/types';
import { IconButton, Menu, Section, Tag, Text, useLocationsContext } from '@tmlmobilidade/ui';
import { useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

import { usePatternDetailContext } from '../../detail/PatternDetail.context';
import { useStopsEditorContext } from '../ShapeEditor.context';

/* * */

export function StopsItem({ pathItem, rowIndex }: { pathItem: Path, rowIndex: number }) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const locationsContext = useLocationsContext();
	const stopsEditorContext = useStopsEditorContext();

	const defaultRule = patternDetailContext.data.stopsParameterRules?.find(rule => rule.kind === 'default');
	const stopItem = patternDetailContext.data.pattern.path[rowIndex];

	const stopLocationInfo = useMemo(() => {
		if (!pathItem.stop) return null;

		const municipalityData = pathItem.stop.municipality_id
			? locationsContext.data.municipalities_map?.get(pathItem.stop.municipality_id)
			: undefined;

		const localityData = pathItem.stop.locality_id
			? locationsContext.data.localitites_map?.get(pathItem.stop.locality_id)
			: undefined;

		const localityName = localityData?.name;
		const municipalityName = municipalityData?.name;

		if (!localityName && !municipalityName) return null;
		if (localityName && !municipalityName) return localityName;
		if (!localityName && municipalityName) return municipalityName;
		if (localityName === municipalityName) return localityName;

		return `${localityName}, ${municipalityName}`;
	}, [pathItem.stop, locationsContext.data.municipalities_map, locationsContext.data.localitites_map]);

	const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);

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
	// B. Handle actions

	const handleEdit = () => {
		// stopsEditorContext.setEditingStop(rowIndex);
	};

	const handleDelete = () => {
		stopsEditorContext.actions.removeStop(rowIndex);
	};

	//
	// B. Render components

	return (
		<div
			className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<Section gap="md" padding="none">
				<div className={styles.stopInfo}>
					<Text weight="semibold">
						{rowIndex + 1}. {pathItem.stop.name}
					</Text>

					<div className={styles.details}>
						<div className={styles.detailsInner}>
							<Text c="var(--color-system-text-200)" size="sm">
								{stopLocationInfo} | #{pathItem.stop._id}
							</Text>

							<Section flexDirection="row" gap="sm" padding="none">
								<Tag icon={<IconClockPause />} label={`${defaultRule?.path[rowIndex]?.dwell_time} s`} tooltip="Tempo de paragem" variant="muted" />
								<Tag icon={<IconClock />} tooltip={`O horário ${stopItem?.timepoint ? 'é' : 'não é'} exato nesta paragem`} variant={stopItem?.timepoint ? 'muted' : 'danger'} />
								<Tag icon={<IconArrowBarToDown />} tooltip={`O embarque ${stopItem?.allow_pickup ? 'é' : 'não é'} permitido nesta paragem`} variant={stopItem?.allow_pickup ? 'muted' : 'danger'} />
								<Tag icon={<IconArrowBarUp />} tooltip={`O desembarque ${stopItem?.allow_drop_off ? 'é' : 'não é'} permitido nesta paragem`} variant={stopItem?.allow_drop_off ? 'muted' : 'danger'} />
							</Section>
						</div>
					</div>
				</div>
			</Section>

			{/* ACTIONS MENU */}
			{isExpanded && (
				<Menu position="bottom-end" shadow="md" width={160}>
					<Menu.Target>
						<div className={styles.menuButton}>
							<IconButton color="var(--color-system-text-200)" icon={<IconDots />} onClick={() => {}} />
						</div>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit}>
							Editar
						</Menu.Item>
						<Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={handleDelete}>
							Eliminar
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			)}
		</div>
	);
}
