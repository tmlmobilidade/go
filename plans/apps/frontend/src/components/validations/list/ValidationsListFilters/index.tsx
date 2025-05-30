/* * */

import { useValidationListContext } from '@/contexts/ValidationList.context';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { Badge, Button, Checkbox, DatePicker, Grid, Label, Menu, Spacer, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export function ValidationsListFilters() {
	return (
		<>
			<Label size="sm" caps singleLine>Filtrar por</Label>
			<ValidityDateFilter />
			<AgencyFilter />
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
				<Text className={styles.filterDescription} size="sm" weight="medium">Datas em que o validação é válido</Text>
				<div className={styles.filterItem}>
					<DatePicker description="Data de início da vigência do validação" flex={1} label="Data de início" onChange={actions.changeValidFrom} value={filters.validFrom ? Dates.fromOperationalDate(filters.validFrom).js_date : null} clearable />
					<DatePicker description="Data de fim da vigência do validação" flex={1} label="Data de fim" onChange={actions.changeValidUntil} value={filters.validUntil ? Dates.fromOperationalDate(filters.validUntil).js_date : null} clearable />
				</div>
			</Menu.Dropdown>
		</Menu>
	);
}

/* * */

function AgencyFilter() {
	const { actions, filters } = useValidationListContext();

	const agencies = AVAILABLE_AGENCIES.map(agency => ({
		label: agency.name,
		value: agency._id,
	}));

	const hasChanged = filters.agencies.length !== agencies.length;

	return (
		<Menu trigger="click-hover" withArrow>
			<Menu.Target>
				<Badge p="xs" type="pill" variant={hasChanged ? 'primary' : 'muted'}>
					<Text className={styles.filterTitle} size="sm" weight="medium">Agências</Text>
				</Badge>
			</Menu.Target>
			<Menu.Dropdown classNames={{ dropdown: styles.dropdown }}>
				<Grid columns="ab" gap="md">
					<Button label="Selecionar todas" onClick={() => actions.toggleAgency('all')} variant="secondary" />
					<Button label="Desselecionar todas" onClick={() => actions.toggleAgency('none')} variant="secondary" />
				</Grid>
				<Spacer orientation="vertical" size="sm" />
				{agencies.map(agency => (
					<div key={agency.value} onClick={() => actions.toggleAgency(agency.value)}>
						<Menu.Item closeMenuOnClick={false} p="sm">
							<div className={styles.filterItem}>
								<Checkbox checked={filters.agencies.includes(agency.value)} />
								<Text className={styles.filterTitle} size="sm" weight="medium">{agency.label}</Text>
							</div>
						</Menu.Item>
					</div>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}
