'use client';

/* * */

import { Label } from '@/components/Label';
import { SeenStatusTag } from '@/components/SeenStatusTag';
import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { type ExtendedRideDisplay, useRidesContext } from '@/contexts/Rides.context';
import { useRidesListContext } from '@/contexts/RidesList.context';
import { IconChevronRight, IconCreditCardPay } from '@tabler/icons-react';
import { Tag } from '@tmlmobilidade/ui';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ViewportList } from 'react-viewport-list';

import { AnalysisStatusTag } from '../AnalysisStatusTag';
import { OperationalStatusTag } from '../OperationalStatusTag';
import { RidesListClock } from '../RidesListClock';
import { StartTimeStatusTag } from '../StartTimeStatusTag';
import styles from './styles.module.css';

/* * */

export function DataTable() {
	//

	//
	// A. Setup variables

	const ridesContext = useRidesContext();
	const ridesListContext = useRidesListContext();
	const operationalDateContext = useOperationalDateContext();

	const [lastUpdatedAtString, setLastUpdatedAtString] = useState<string>('---');

	//
	// B. Transform data

	useEffect(() => {
		console.log('ridesContext.data.last_update', ridesContext.data.last_update);
		const updateString = () => {
			console.log('ridesContext.data.last_update', ridesContext.data.last_update);
			const diff = DateTime.now().toMillis() - ridesContext.data.last_update; // milliseconds
			if (diff < 1000) return setLastUpdatedAtString('just now');
			if (diff < 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000)} seconds ago`);
			if (diff < 60 * 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60)} minutes ago`);
			if (diff < 24 * 60 * 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60 / 60)} hours ago`);
			return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60 / 60 / 24)} days ago`);
		};
		updateString();
		const interval = setInterval(updateString, 1000);
		return () => clearInterval(interval);
	}, [ridesContext.data.last_update]);

	//
	// B. Render components

	return (
		<div className={styles.wrapper}>

			<div className={styles.header}>

				<div className={styles.preHeader}>
					<div>current operational_date: {operationalDateContext.data.selected_date} <span onClick={operationalDateContext.actions.updateSelectedDateToLessOneDay}>prev</span> <span onClick={operationalDateContext.actions.updateSelectedDateToPlusOneDay}>next</span></div>
					<div onClick={() => ridesListContext.actions.setLockStatus()} style={{ display: 'flex', zIndex: 100 }}>
						{ridesListContext.data.is_locked ? 'Locked' : 'Unlocked'}
						| {ridesListContext.data.is_user_scrolling ? 'IsScrollingUser-true' : 'IsScrollingUser-false'}
					</div>
					<div onClick={() => ridesListContext.actions.updateLockIndex()} style={{ display: 'flex', zIndex: 100 }}>
						lock index {ridesListContext.data.lock_index} | lock offset {ridesListContext.data.lock_offset}
					</div>
					<div onClick={() => ridesListContext.actions.updateLockIndex()} style={{ display: 'flex', zIndex: 100 }}>
						{lastUpdatedAtString}
					</div>
				</div>

				<div className={styles.row}>
					<div className={styles.cell} />
					<div className={styles.cell}>
						<Label size="sm" caps>Estado</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>Pattern</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>Partida</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>Observado</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>Validações</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>SIMPLE_THREE_VEH...</Label>
					</div>
					<div className={styles.cell} />
					{/* <div className={styles.cell}>
						<Label size="sm" caps>Ride ID</Label>
					</div> */}
				</div>
			</div>

			{ridesListContext.flags.is_loading && (
				<div className={styles.loading}>
					<Label size="md" caps>Loading {ridesListContext.data.rides_display.length} Rides...</Label>
				</div>
			)}

			{!ridesListContext.flags.is_loading && (
				<div className={styles.body}>
					<ViewportList ref={ridesListContext.data.list_ref} itemMargin={0} items={ridesListContext.data.rides_display}>
						{(item, index) => (
							<DataTableRow key={item._id} index={index} item={item} />
						)}
					</ViewportList>
				</div>
			)}

		</div>
	);

	//
}

/* * */

interface DataTableRowProps {
	index: number
	item: ExtendedRideDisplay
}

export function DataTableRow({ index, item }: DataTableRowProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const ridesListContext = useRidesListContext();

	const handleOpenRide = (rideId: string) => {
		router.push(`/list/${rideId}`);
	};

	//
	// B. Render components

	return (

		<div key={item._id} className={styles.rowWrapper}>
			{index === ridesListContext.data.lock_index && (
				<RidesListClock />
			)}
			<div key={item._id} className={styles.row} onClick={() => handleOpenRide(item._id)}>
				<div className={styles.cell}>
					<SeenStatusTag value={item.seen_status} />
				</div>
				<div className={styles.cell}>
					<OperationalStatusTag value={item.operational_status} />
				</div>
				<div className={styles.cell}>
					<Tag label={item.pattern_id} variant="secondary" />
					<Label lines={1} size="md">{item.headsign}</Label>
				</div>
				<div className={styles.cell}>
					<Tag label={item.start_time_scheduled_display} variant="primary" />
				</div>
				<div className={styles.cell}>
					<StartTimeStatusTag status={item.delay_status} timeString={item.start_time_observed_display} />
				</div>
				<div className={styles.cell}>
					{item.validations_count > 0 && <Tag icon={<IconCreditCardPay />} label={item.validations_count} variant="secondary" />}
				</div>
				<div className={styles.cell}>
					<AnalysisStatusTag grade={item.simple_three_vehicle_events_grade} operationalStatus={item.operational_status} />
				</div>
				{/* <div className={styles.cell}>
								{item._id}
							</div> */}
				<div className={styles.cell}>
					<IconChevronRight className={styles.chevron} size={18} />
				</div>
			</div>
		</div>
	);

	//
}
