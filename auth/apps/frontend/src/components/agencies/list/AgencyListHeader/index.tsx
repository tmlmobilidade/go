/* * */

import { useAgencyListContext } from '@/contexts/AgencyList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AgencyListHeader() {
	//

	//
	// A. Setup variables

	const agencyListContext = useAgencyListContext();

	//
	// B. Render components

	return (
		<Section alignItems="center" flexDirection="row" gap="sm" justifyContent="space-between">
			<Label size="lg" caps>Agências</Label>
			<Spacer />
			<Section alignItems="center" flexDirection="row" flexWrap="nowrap" gap="sm" padding="none">
				<TextInput
					leftSection={<IconSearch size={20} />}
					miw={400}
					onChange={e => agencyListContext.actions.changeSearchQuery(e.target.value)}
					placeholder="Pesquisar..."
					value={agencyListContext.filters.search_query}
				/>
				<Button
					href={Routes.AGENCY_DETAIL('new')}
					icon={<IconPlus size={20} />}
					label="Nova agência"
				/>
			</Section>
		</Section>
	);

	//
}
