'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useMotisLocationSearch } from '@/components/routes/RoutePlannerInput/useMotisLocationSearch';
import { RoutePlannerLocationResults } from '@/components/routes/RoutePlannerLocationResults';
import { type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerDestinationSearch() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();

	const inputRef = useRef<HTMLInputElement>(null);
	const [activeList, setActiveList] = useState<'favorites' | 'recents'>('recents');
	const [query, setQuery] = useState('');
	const search = useMotisLocationSearch(query);

	//
	// B. Transform data

	const recentLocations = useMemo<RoutePlannerLocation[]>(() => {
		return [
			{
				areas: [{ name: 'Lisboa' }],
				detail: '',
				label: t('default:routes.RoutePlannerSearch.recents.lisboa_oriente'),
				lat: 38.76861,
				lon: -9.09873,
				modes: ['RAIL', 'SUBWAY', 'BUS'],
				type: 'STOP',
			},
			{
				areas: [{ name: 'Lisboa' }],
				detail: '',
				label: t('default:routes.RoutePlannerSearch.recents.santa_apolonia'),
				lat: 38.71383,
				lon: -9.12292,
				modes: ['RAIL', 'BUS'],
				type: 'STOP',
			},
			{
				areas: [{ name: 'Lisboa' }],
				detail: '',
				label: t('default:routes.RoutePlannerSearch.recents.campo_grande'),
				lat: 38.75988,
				lon: -9.15794,
				modes: ['SUBWAY', 'BUS'],
				type: 'STOP',
			},
		];
	}, [t]);

	const shouldShowSearchResults = query.trim().length >= 2;
	const listLocations = activeList === 'recents' ? recentLocations : [];
	const searchTarget = routePlannerContext.data.location_search_target;

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		}, 80);

		return () => window.clearTimeout(timeout);
	}, []);

	//
	// C. Handle actions

	const handleSelect = (location: RoutePlannerLocation) => {
		if (searchTarget === 'origin') {
			void routePlannerContext.actions.selectOrigin(location);
			return;
		}

		void routePlannerContext.actions.selectDestination(location);
	};

	//
	// D. Render components

	return (
		<div className={styles.container}>
			<div className={styles.searchBox}>
				<IconSearch size={22} />
				<input
					ref={inputRef}
					autoComplete="off"
					onChange={event => setQuery(event.currentTarget.value)}
					placeholder={searchTarget === 'origin' ? t('default:routes.RoutePlannerSearch.origin_placeholder') : t('default:routes.RoutePlannerSearch.destination_placeholder')}
					type="search"
					value={query}
					autoFocus
				/>
			</div>

			{!shouldShowSearchResults && (
				<div className={styles.listTabs}>
					<button
						data-active={activeList === 'recents'}
						onClick={() => setActiveList('recents')}
						type="button"
					>
						{t('default:routes.RoutePlannerSearch.recents.title')}
					</button>
					<button
						data-active={activeList === 'favorites'}
						onClick={() => setActiveList('favorites')}
						type="button"
					>
						{t('default:routes.RoutePlannerSearch.favorites.title')}
					</button>
				</div>
			)}

			<div className={styles.resultsSection}>
				{shouldShowSearchResults ? (
					<RoutePlannerLocationResults
						error={search.error}
						isLoading={search.isLoading}
						loadingLabel={t('default:routes.RoutePlannerInput.search.loading')}
						locations={search.data}
						onSelect={handleSelect}
						variant="inline"
					/>
				) : (
					<>
						<RoutePlannerLocationResults
							error={null}
							isLoading={false}
							loadingLabel={t('default:routes.RoutePlannerInput.search.loading')}
							locations={listLocations}
							onSelect={handleSelect}
							variant="inline"
						/>
						{activeList === 'favorites' && (
							<div className={styles.emptyState}>
								{t('default:routes.RoutePlannerSearch.favorites.empty')}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);

	//
}
