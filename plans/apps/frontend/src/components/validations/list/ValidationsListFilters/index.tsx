/* * */

import { useValidationListContext } from '@/contexts/ValidationList.context';
import { Badge, DatePicker, Label, Menu, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export function ValidationsListFilters() {
	return (
		<>
			<Label size="sm" caps singleLine>Filtrar por</Label>
			<ValidityDateFilter />
		</>
	);
}

/* * */

function ValidityDateFilter() {
	const { actions, filters } = useValidationListContext();

	const hasChanged = filters.validFrom || filters.validUntil;

	return (
		<Menu closeOnClickOutside={false} trigger="click-hover" withArrow>
			<Menu.Target>
				<Badge p="sm" type="pill" variant={hasChanged ? 'primary' : 'muted'}>
					<Text className={styles.filterTitle} size="sm" weight="medium">Vigência</Text>
				</Badge>
			</Menu.Target>
			<Menu.Dropdown classNames={{ dropdown: styles.dropdown }}>
				<Text className={styles.filterDescription} size="sm" weight="medium">Datas em que o validationo é válido</Text>
				<div className={styles.filterItem}>
					<DatePicker description="Data de início da vigência do validationo" flex={1} label="Data de início" onChange={actions.changeValidFrom} value={filters.validFrom ? Dates.fromOperationalDate(filters.validFrom).js_date : null} clearable />
					<DatePicker description="Data de fim da vigência do validationo" flex={1} label="Data de fim" onChange={actions.changeValidUntil} value={filters.validUntil ? Dates.fromOperationalDate(filters.validUntil).js_date : null} clearable />
				</div>
			</Menu.Dropdown>
		</Menu>
	);
}
