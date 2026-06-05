/* * */

import { IconDisplay } from '@/components/common/display/IconDisplay';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useOperationalDateContext } from '@/components/common/operational-date/OperationalDate.context';
import { formatStopLocation } from '@/utils/format-stop-location';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { IconArrowUpRight } from '@tabler/icons-react';
import { type HubWaypoint } from '@tmlmobilidade/types';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

interface Props {
	isFirstStop?: boolean
	isLastStop?: boolean
	isSelected: boolean
	waypointData: HubWaypoint
}

/* * */

export function PathWaypointHeader({ isFirstStop, isLastStop, isSelected, waypointData }: Props) {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const operationalDateContext = useOperationalDateContext();

	const stopIdClipboard = useClipboard();

	//
	// B. Fetch data

	const stopData = stopsContext.actions.getStopById(waypointData.stop_id);

	//
	// C. Handle actions

	const handleClickStopId = () => {
		if (!isSelected) return;
		stopIdClipboard.copy(waypointData.stop_id);
	};
	//
	// D. Render components

	if (!stopData) {
		return null;
	}

	return (
		<div className={`${styles.container} ${isFirstStop && styles.isFirstStop} ${isLastStop && styles.isLastStop} ${isSelected && styles.isSelected}`}>

			<p className={styles.stopName}>
				{stopData.name}
				{isSelected && (
					<Link
						className={styles.stopNameUrl}
						href={`/stops/${waypointData.stop_id}?day=${operationalDateContext.data.selected_date?.operational_date}`}
						target="_blank"
					>
						<IconArrowUpRight size={16} />
					</Link>
				)}
			</p>

			<div className={styles.subHeaderWrapper}>
				<p className={styles.stopLocation}>{formatStopLocation(stopData.locality_name, stopData.municipality_name)}</p>
				<p className={`${styles.stopId} ${stopIdClipboard.copied && styles.isCopied}`} onClick={handleClickStopId}>
					#{stopData._id}
					{stopIdClipboard.copied ? <IconCheck className={styles.stopIdCopyIcon} /> : <IconCopy className={styles.stopIdCopyIcon} />}
				</p>
			</div>
			{isSelected && stopData.flags.length > 0 && (
				<div className={styles.facilitiesWrapper}>
					{stopData.flags.map(flag => (
						<IconDisplay key={flag.short_name} category="facilities" name={flag.short_name} />
					))}
				</div>
			)}
		</div>
	);

	//
}
