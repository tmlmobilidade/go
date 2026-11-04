'use client';

import { AlertEffectIcon } from '@/components/alerts/common/AlertEffectIcon';
import { getAgencyDisplayInfo, getAgencyLogo } from '@/lib/agency-catalog';
import { GtfsRtEffect } from '@tmlmobilidade/go-types-gtfs-rt';
import { Section, Surface } from '@tmlmobilidade/ui';
import Image from 'next/image';

import styles from './styles.module.css';

interface AlertDetailViewHeaderProps {
	agencyId: string
	effect: GtfsRtEffect
	title: string
}

/* * */

export function AlertDetailViewHeader({ agencyId, effect, title }: AlertDetailViewHeaderProps) {
	//

	// A. Setup variables

	const agency = getAgencyDisplayInfo(agencyId);
	const agencyLogo = getAgencyLogo(agencyId, '180x120', 'light');

	// B. Render components

	return (
		<Surface variant="transparent">
			<Section className={styles.section} gap="sm">
				<div className={styles.row}>
					<AlertEffectIcon effect={effect} />
					<p className={styles.alertTitle}>
						{title}
					</p>
					{agencyLogo && <Image alt={agency?.fullName ?? ''} className={styles.agencyLogo} height={40} src={agencyLogo} width={60} />}
				</div>
			</Section>
		</Surface>
	);
}
