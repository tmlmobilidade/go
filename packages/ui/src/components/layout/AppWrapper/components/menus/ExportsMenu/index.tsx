'use client';

/* * */

import { AppWrapperMenu } from '@/components/layout/AppWrapper/components/common/AppWrapperMenu';
import { AppWrapperMenuList } from '@/components/layout/AppWrapper/components/common/AppWrapperMenuList';
import { AppWrapperMenuNoContent } from '@/components/layout/AppWrapper/components/common/AppWrapperMenuNoContent';
import { useExportsContext } from '@/contexts/exports.context';
import { IconCloudDown, IconCloudMinus } from '@tabler/icons-react';

import { ExportsMenuItem } from '../ExportsMenuItem';

/* * */

export function ExportsMenu() {
	//

	//
	// A. Setup variables

	const exportsContext = useExportsContext();
	const fileExports = exportsContext.data.fileExports || [];

	//
	// B. Render components

	return (
		<AppWrapperMenu counter={fileExports.length} icon={IconCloudDown}>
			{fileExports.length === 0
				? <AppWrapperMenuNoContent icon={IconCloudMinus} text="Sem exportações disponíveis" />
				: <AppWrapperMenuList data={fileExports} itemComponent={({ item }) => <ExportsMenuItem fileExport={item} />} title="Exportações" />}
		</AppWrapperMenu>
	);

	//
}
