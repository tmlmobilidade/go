/* * */

import { useStopsData } from '@/components/stops/use-stops-data';
import { formatStopLocation } from '@/utils/transit/format-stop-location';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { type HubV1ApiPatternWaypoint } from '@tmlmobilidade/go-types-hub';
import { useClipboard } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	controlsId: string
	isFirstStop?: boolean
	isLastStop?: boolean
	isSelected: boolean
	onToggle: () => void
	waypointData: HubV1ApiPatternWaypoint
}

/* * */

export function PathWaypointHeader({ controlsId, isFirstStop, isLastStop, isSelected, onToggle, waypointData }: Props) {
	//

	//
	// A. Setup variables

	const { data: stops } = useStopsData();
	const { t } = useTranslation();

	const stopIdClipboard = useClipboard();

	//
	// B. Fetch data

	const stopData = stops.find(stop => String(stop._id) === String(waypointData.stop_id));

	//
	// C. Handle actions

	const handleClickStopId = () => {
		stopIdClipboard.copy(waypointData.stop_id);
	};
	//
	// D. Render components

	if (!stopData) {
		return null;
	}

	return (
		<div className={`${styles.container} ${isFirstStop && styles.isFirstStop} ${isLastStop && styles.isLastStop} ${isSelected && styles.isSelected}`}>
			<button
				aria-controls={isSelected ? controlsId : undefined}
				aria-expanded={isSelected}
				className={styles.stopName}
				onClick={onToggle}
				type="button"
				aria-label={t('default:lines.LinesDetailPath.stop_details_name', '', {
					index: waypointData.stop_sequence,
					stop_name: stopData.name,
				})}
			>
				{stopData.name}
			</button>

			<div className={styles.subHeaderWrapper}>
				<p className={styles.stopLocation}>{formatStopLocation(stopData.locality_name, stopData.municipality_name)}</p>
				{isSelected ? (
					<button
						className={`${styles.stopId} ${stopIdClipboard.copied && styles.isCopied}`}
						onClick={handleClickStopId}
						type="button"
						aria-label={stopIdClipboard.copied
							? t('default:common.CopyBadge.copied')
							: t('default:common.CopyBadge.copy', '', { value: stopData._id })}
					>
						#{stopData._id}
						{stopIdClipboard.copied
							? <IconCheck aria-hidden="true" className={styles.stopIdCopyIcon} />
							: <IconCopy aria-hidden="true" className={styles.stopIdCopyIcon} />}
					</button>
				) : (
					<p className={styles.stopId}>
						#{stopData._id}
					</p>
				)}
			</div>
		</div>
	);
}
