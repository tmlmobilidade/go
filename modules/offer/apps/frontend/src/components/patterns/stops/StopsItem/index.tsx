'use client';

/* * */

import { IconArrowBarToDown, IconArrowBarUp, IconClock, IconClockPause, IconEdit, IconFocus2, IconTrash } from '@tabler/icons-react';
import { Path } from '@tmlmobilidade/types';
import { Button, Section, Tag, Text, useLocationsContext } from '@tmlmobilidade/ui';
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

	const handleCenter = () => {
		// stopsEditorContext.actions.centerStop(rowIndex);
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
								<Tag icon={<IconClock />} label={stopItem?.timepoint ? 'Ponto horário' : 'Sem ponto horário'} tooltip="O horário é exato nesta paragem" variant={stopItem?.timepoint ? 'muted' : 'danger'} />
								<Tag icon={<IconArrowBarToDown />} label={stopItem?.allow_pickup ? 'Embarque' : 'Sem embarque'} variant={!stopItem?.allow_pickup ? 'muted' : 'danger'} />
								<Tag icon={<IconArrowBarUp />} label={stopItem?.allow_drop_off ? 'Desembarque' : 'Sem desembarque'} variant={stopItem?.allow_drop_off ? 'muted' : 'danger'} />
							</Section>

							<Section flexDirection="row" gap="sm" padding="none">
								<Button label="Editar" leftSection={<IconEdit />} onClick={handleEdit} variant="transparent" />
								<Button label="Centrar" leftSection={<IconFocus2 />} onClick={handleCenter} variant="transparent" />
								<Button label="Eliminar" leftSection={<IconTrash />} onClick={handleDelete}	variant="transparent" />
							</Section>
						</div>
					</div>
				</div>
			</Section>
		</div>
	);
}
