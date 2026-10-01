'use client';

import { Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { StopsListFilterSearch } from '../filters/StopsListFilterSearch';
import { StopsListHeaderMenu } from '../StopsListHeaderMenu';
import { useStopsListData } from '../use-stops-list-data';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useStopsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:stops.list.Header.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer shrink />
			<StopsListFilterSearch />
			<StopsListHeaderMenu />
		</Toolbar>
	);
}
