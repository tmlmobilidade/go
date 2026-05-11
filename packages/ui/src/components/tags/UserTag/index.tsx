'use client';

import { Dates } from '@tmlmobilidade/dates';
import { useMemo } from 'react';

import { useDataSimplifiedUser } from '../../../hooks/use-data/use-data-simplified-user';
import { Inline } from '../../display/Inline';
import { Tag } from '../Tag';
import { UserTagCard } from '../UserTagCard';

/* * */

interface UserTagProps {
	showFullName?: boolean
	userId: string
	variant?: 'inline' | 'tag'
}

/* * */

export function UserTag({ showFullName = true, userId, variant = 'tag' }: UserTagProps) {
	//

	//
	// A. Fetch data

	const { data: simplifiedUserData } = useDataSimplifiedUser({ _id: userId });

	//
	// B. Transform data

	const displayName = useMemo(() => {
		if (!simplifiedUserData?.first_name) return '• • •';
		if (!showFullName) return simplifiedUserData.first_name;
		const fullName = `${simplifiedUserData.first_name} ${simplifiedUserData.last_name}`;
		return fullName.trim();
	}, [simplifiedUserData, showFullName]);

	//
	// C. Render components

	if (userId === 'system') {
		return (
			<UserTagCard
				fullName="Plataforma GO"
				organizationName="Sistema"
				seenLastAt={Dates.now('Europe/Lisbon').unix_timestamp}
			>
				<Inline dotted>GO</Inline>
			</UserTagCard>
		);
	}

	if (variant === 'inline') {
		return (
			<UserTagCard
				fullName={displayName}
				organizationName={simplifiedUserData?.organization_name || '-'}
				seenLastAt={simplifiedUserData?.seen_last_at}
			>
				<Inline dotted>{displayName}</Inline>
			</UserTagCard>
		);
	}

	return (
		<UserTagCard
			fullName={displayName}
			organizationName={simplifiedUserData?.organization_name || '-'}
			seenLastAt={simplifiedUserData?.seen_last_at}
		>
			<Tag
				label={displayName}
				variant="secondary"
			/>
		</UserTagCard>
	);
}
