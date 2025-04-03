'use client';

/* * */

import { AnalysisStatusTag } from '@/components/AnalysisStatusTag';
import { RidesCatalogClock } from '@/components/catalog/RidesCatalogClock';
import { RidesCatalogHeader } from '@/components/catalog/RidesCatalogHeader';
import { OperationalStatusTag } from '@/components/OperationalStatusTag';
import { SeenStatusTag } from '@/components/SeenStatusTag';
import { StartTimeStatusTag } from '@/components/StartTimeStatusTag';
import { type ExtendedRideDisplay } from '@/contexts/Rides.context';
import { useRidesCatalogContext } from '@/contexts/RidesCatalog.context';
import { IconChevronRight, IconCreditCardPay } from '@tabler/icons-react';
import { Label, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { ViewportList } from 'react-viewport-list';

import styles from './styles.module.css';

/* * */

export function RidesCatalog() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesCatalogContext();

	//
	// B. Render components

	return (
		<Pane header={[<RidesCatalogHeader />]}>

			<div className={styles.header}>

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
							<RidesCatalogRow key={item._id} index={index} item={item} />
						)}
					</ViewportList>
				</div>
			)}

		</Pane>
	);

	//
}

/* * */

interface RidesCatalogRowProps {
	index: number
	item: ExtendedRideDisplay
}

export function RidesCatalogRow({ index, item }: RidesCatalogRowProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const ridesListContext = useRidesCatalogContext();

	//
	// B. Handle actions

	const handleOpenRide = (rideId: string) => {
		router.push(`/${rideId}`);
	};

	//
	// C. Render components

	return (

		<div key={item._id} className={styles.rowWrapper}>
			{index === ridesListContext.data.lock_index && (
				<RidesCatalogClock />
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
					<Label size="md" singleLine>{item.headsign}</Label>
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
