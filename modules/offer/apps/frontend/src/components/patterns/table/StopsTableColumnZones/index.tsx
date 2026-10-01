'use client';

import { usePatternDetailContext } from '@/components/patterns/detail//PatternDetail.context';
import { IconRotate2, IconTicket } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Path, Zone } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, IconButton, MultiSelect } from '@tmlmobilidade/ui';
import useSWR from 'swr';

import styles from '../styles.module.css';

/* * */

export function StopsTableTableColumnZones({ pathItem, rowIndex }: { pathItem: Path, rowIndex: number }) {
	//

	// A. Setup variables

	const patternsDetailContext = usePatternDetailContext();

	//
	// B. Fetch data

	const { data: zonesData } = useSWR(API_ROUTES.offer.ZONES_LIST, {
		fetcher: async url => await fetchApiData<Zone[]>({ url }),
	});

	const zonesOptions = zonesData?.data?.map(zone => ({
		label: zone.name,
		value: zone._id,
	})) || [];

	//
	// C. Handle actions

	const handleResetZones = () => {
		if (patternsDetailContext.data.pattern.path) {
			patternsDetailContext.data.form.setFieldValue(`path.${rowIndex}.zones`, pathItem.zones);
		}
	};

	//
	// D. Render components

	return (
		<div className={styles.column}>
			<MultiSelect
				key={patternsDetailContext.data.form.key(`path.${rowIndex}.zones`)}
				data={zonesOptions}
				readOnly={patternsDetailContext.flags.isReadOnly}
				rightSection={<IconTicket size={20} />}
				w="100%"
				leftSection={(
					<IconButton
						color="gray"
						icon={<IconRotate2 size={20} />}
						isDisabled={patternsDetailContext.flags.isReadOnly}
						onClick={handleResetZones}
						variant="subtle"
					/>
				)}
				searchable
				{...patternsDetailContext.data.form.getInputProps(`path.${rowIndex}.zones`)}
			/>
		</div>
	);

	//
}
