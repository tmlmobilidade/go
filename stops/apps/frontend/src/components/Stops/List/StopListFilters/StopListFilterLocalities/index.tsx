/* * */

import { Badge, Grid, Menu } from '@tmlmobilidade/ui';

import { StopListFilterDistrict } from './StopListFilterDistrict';
// import { StopListFilterMunicipality } from './StopListFilterMuncipality';
// import { StopListFilterParish } from './StopListFilterParishes';

/* * */

export function StopListFilterLocations() {
	return (
		<Menu trigger="click-hover" withArrow>
			<Menu.Target>
				<Badge>Paragens</Badge>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item closeMenuOnClick={false} p="sm">
					<div>
						<Grid columns="abc" gap="sm">
							<StopListFilterDistrict />
						</Grid>
					</div>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>

	);
}
