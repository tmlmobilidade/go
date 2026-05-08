'use client';

import { HoverCard } from '@mantine/core';
import { Dates } from '@tmlmobilidade/dates';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { type PropsWithChildren, useEffect, useState } from 'react';

import styles from './styles.module.css';

import { Indicator, type IndicatorProps } from '../../display/Indicator';
import { Label } from '../../display/Label';

/* * */

interface UserTagCardProps {
	fullName: string
	organizationName: string
	seenLastAt: UnixTimestamp
}

/* * */

export function UserTagCard({ children, fullName, organizationName, seenLastAt }: PropsWithChildren<UserTagCardProps>) {
	//

	//
	// A. Setup variables

	const [indicatorVariant, setIndicatorVariant] = useState<IndicatorProps['variant']>('muted');
	const [seenLastAtRelativeString, setSeenLastAtRelativeString] = useState('');

	//
	// C. Transform data

	useEffect(() => {
		const updateRelativeTimeString = () => {
			const diff = Dates.now('utc').unix_timestamp - (seenLastAt ?? 0);
			if (diff < 60 * 1_000) return setSeenLastAtRelativeString('Online Agora');
			if (diff < 60 * 60 * 1_000) return setSeenLastAtRelativeString(`Online há ${Math.floor(diff / 1000 / 60)} min`);
			if (diff < 24 * 60 * 60 * 1_000) return setSeenLastAtRelativeString(`Online há ${Math.floor(diff / 1000 / 60 / 60)} h`);
			return setSeenLastAtRelativeString(`Online há ${Math.floor(diff / 1000 / 60 / 60 / 24)} d`);
		};
		updateRelativeTimeString();
		const interval = setInterval(() => updateRelativeTimeString(), 1_000);
		return () => clearInterval(interval);
	}, [seenLastAt]);

	useEffect(() => {
		const updateIndicatorVariant = () => {
			const diff = Dates.now('utc').unix_timestamp - (seenLastAt ?? 0);
			if (diff < 60 * 1_000) return setIndicatorVariant('primary');
			return setIndicatorVariant('muted');
		};
		updateIndicatorVariant();
		const interval = setInterval(() => updateIndicatorVariant(), 1_000);
		return () => clearInterval(interval);
	}, [seenLastAt]);

	//
	// D. Render components

	return (
		<HoverCard shadow="md" width={280} withArrow>
			<HoverCard.Target>
				{children}
			</HoverCard.Target>
			<HoverCard.Dropdown>
				<div className={styles.container}>
					<Label size="md">{fullName}</Label>
					<Label size="md" variant="muted">{organizationName}</Label>
					<div className={styles.row}>
						<Label size="sm" variant="primary" caps>{seenLastAtRelativeString}</Label>
						<Indicator variant={indicatorVariant} filled />
					</div>
				</div>
			</HoverCard.Dropdown>
		</HoverCard>
	);
}
