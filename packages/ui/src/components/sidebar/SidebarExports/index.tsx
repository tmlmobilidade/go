'use client';

import { type MenuProps } from '@mantine/core';
import { IconCloudDown, IconCloudMinus } from '@tabler/icons-react';

import { useExportsContext } from '../../../contexts/exports.context';
import { Menu } from '../../menu/Menu';
import { MenuList } from '../../menu/MenuList';
import { MenuNoContent } from '../../menu/MenuNoContent';
import { SidebarExportsItem } from '../SidebarExportsItem';

/* * */

export interface SidebarExportsProps {
	menuPosition?: MenuProps['position']
}

/* * */

export function SidebarExports({ menuPosition }: SidebarExportsProps = {}) {
	//

	//
	// A. Setup variables

	const exportsContext = useExportsContext();
	const fileExports = exportsContext.data.fileExports || [];

	//
	// B. Render components

	return (
		<Menu counter={fileExports.length} icon={IconCloudDown} label="Exportações" menuPosition={menuPosition} variant="danger">
			{fileExports.length === 0
				? <MenuNoContent icon={IconCloudMinus} text="Sem exportações disponíveis" />
				: <MenuList data={fileExports} itemComponent={({ item }) => <SidebarExportsItem fileExport={item} />} title="Exportações" />}
		</Menu>
	);

	//
}
