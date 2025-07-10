/* * */

import { usePlanListContext } from '@/contexts/PlansList.context';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { Button, Checkbox, DatePicker, Grid, Label, Menu, Spacer, Tag, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

export function PlansListFilters() {
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
	const { actions, filters } = usePlanListContext();

	const hasChanged = filters.validFrom || filters.validUntil;

	return (
		<Menu closeOnClickOutside={false} trigger="click-hover" withArrow>
			<Menu.Target>
				<Tag label="Vigência" variant={hasChanged ? 'primary' : 'muted'} />
			</Menu.Target>
			<Menu.Dropdown classNames={{ dropdown: styles.dropdown }}>
				<Text className={styles.filterDescription} size="sm" weight="medium">Datas em que o plano é válido</Text>
				<div className={styles.filterItem}>
					<DatePicker description="Data de início da vigência do plano" flex={1} label="Data de início" onChange={actions.changeValidFrom} value={filters.validFrom ? Dates.fromOperationalDate(filters.validFrom, 'local').js_date : null} clearable />
					<DatePicker description="Data de fim da vigência do plano" flex={1} label="Data de fim" onChange={actions.changeValidUntil} value={filters.validUntil ? Dates.fromOperationalDate(filters.validUntil, 'local').js_date : null} clearable />
				</div>
			</Menu.Dropdown>
		</Menu>
	);
}

/* * */

function AgencyFilter() {
	const { actions, filters } = usePlanListContext();

	const agencies = AVAILABLE_AGENCIES.map(agency => ({
		label: agency.name,
		value: agency._id,
	}));

	const hasChanged = filters.agencies.length !== agencies.length;

	return (
		<Menu trigger="click-hover" withArrow>
			<Menu.Target>
				<Tag label="Agências" variant={hasChanged ? 'primary' : 'muted'} />
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
