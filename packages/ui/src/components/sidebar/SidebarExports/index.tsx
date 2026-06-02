'use client';

import { type MenuProps } from '@mantine/core';
import { IconCloudDown, IconCloudMinus } from '@tabler/icons-react';
import { type FileExport } from '@tmlmobilidade/types';

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

function SidebarExportsMenuItem({ item }: { item: FileExport }) {
	return <SidebarExportsItem fileExport={item} />;
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
				: <MenuList data={fileExports} getItemKey={item => item._id} itemComponent={SidebarExportsMenuItem} title="Exportações" />}
		</Menu>
	);

	//
}
