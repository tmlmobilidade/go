/* * */

import { usePlanListContext } from '@/contexts/PlanList.context';
import { Badge, DatePicker, Label, Menu, Text } from '@tmlmobilidade/ui';
import { operationalDateToJsDate } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export function PlansListFilters() {
	return (
		<>
			<Label size="sm" caps singleLine>Filtrar por</Label>
			<ValidityDateFilter />
		</>
	);
}

/* * */

function ValidityDateFilter() {
	const { actions, filters } = usePlanListContext();

	const hasChanged = filters.validFrom || filters.validUntil;

	return (
		<Menu closeOnClickOutside={false} trigger="click-hover" withArrow>
			<Menu.Target>
				<Badge p="sm" type="pill" variant={hasChanged ? 'primary' : 'muted'}>
					<Text className={styles.filterTitle} size="sm" weight="medium">Vigência</Text>
				</Badge>
			</Menu.Target>
			<Menu.Dropdown classNames={{ dropdown: styles.dropdown }}>
				<Text className={styles.filterDescription} size="sm" weight="medium">Datas em que o plano é válido</Text>
				<div className={styles.filterItem}>
					<DatePicker description="Data de início da vigência do plano" flex={1} label="Data de início" onChange={actions.changeValidFrom} value={filters.validFrom ? operationalDateToJsDate(filters.validFrom) : null} clearable />
					<DatePicker description="Data de fim da vigência do plano" flex={1} label="Data de fim" onChange={actions.changeValidUntil} value={filters.validUntil ? operationalDateToJsDate(filters.validUntil) : null} clearable />
				</div>
			</Menu.Dropdown>
		</Menu>
	);
}
