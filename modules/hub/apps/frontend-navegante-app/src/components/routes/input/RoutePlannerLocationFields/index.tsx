'use client';

import { RoutePlannerLocationInput } from '@/components/routes/input/RoutePlannerLocationInput';
import { useRoutePlannerLocationFields } from '@/hooks/route-planner/useRoutePlannerLocationFields';
import { type RoutePlannerLocation } from '@/types/route-planner';
import { IconArrowsUpDown, IconMapPinFilled, IconPointFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export interface RoutePlannerLocationFieldsProps {
	destination: null | RoutePlannerLocation
	onDestinationChange: (location: null | RoutePlannerLocation) => void
	onOriginChange: (location: null | RoutePlannerLocation) => void
	onSwap: () => void
	origin: null | RoutePlannerLocation
	variant: 'compact' | 'default'
}

/* * */

export function RoutePlannerLocationFields(props: RoutePlannerLocationFieldsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const fields = useRoutePlannerLocationFields(props);

	//
	// B. Render components

	return (
		<div className={styles.container} data-variant={props.variant}>
			<div className={styles.track}>
				<IconPointFilled className={styles.originDot} size={16} />
				<span className={styles.trackLine} />
				<IconMapPinFilled className={styles.destinationPin} size={16} />
			</div>

			<div className={styles.fields}>
				<RoutePlannerLocationInput
					actionLabel={fields.isCurrentLocationOrigin ? undefined : t('default:routes.RoutePlannerInput.origin.useLocation')}
					error={fields.originSearch.error}
					isActive={fields.activeField === 'origin'}
					isLoading={fields.originSearch.isLoading && fields.originSearchData.length === 0}
					label={t('default:routes.RoutePlannerInput.origin.label')}
					loadingLabel={t('default:routes.RoutePlannerInput.search.loading')}
					locations={fields.originSearchData}
					onAction={fields.isCurrentLocationOrigin ? undefined : fields.handleOriginLocationClick}
					onFocus={() => fields.setActiveField('origin')}
					onQueryChange={fields.handleOriginQueryChange}
					onSelect={fields.handleOriginSelect}
					placeholder={t('default:routes.RoutePlannerInput.origin.placeholder')}
					query={fields.originQuery}
					variant={props.variant}
				/>

				<div className={styles.swapRow}>
					<button aria-label={t('default:routes.RoutePlannerInput.swap')} className={styles.swapButton} onClick={props.onSwap} type="button">
						<IconArrowsUpDown size={16} />
					</button>
				</div>

				<RoutePlannerLocationInput
					error={fields.destinationSearch.error}
					isActive={fields.activeField === 'destination'}
					isLoading={fields.destinationSearch.isLoading}
					label={t('default:routes.RoutePlannerInput.destination.label')}
					loadingLabel={t('default:routes.RoutePlannerInput.search.loading')}
					locations={fields.destinationSearch.data}
					onFocus={() => fields.setActiveField('destination')}
					onQueryChange={fields.handleDestinationQueryChange}
					onSelect={fields.handleDestinationSelect}
					placeholder={t('default:routes.RoutePlannerInput.destination.placeholder')}
					query={fields.destinationQuery}
					variant={props.variant}
				/>
			</div>
		</div>
	);

	//
}
