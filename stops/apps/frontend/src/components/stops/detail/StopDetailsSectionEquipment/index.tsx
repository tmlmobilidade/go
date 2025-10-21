'use client';

/* * */

import { FacilityCheckbox } from '@/components/stops/detail/StopDetailFacilityCheckbox';
import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { ScopeOption } from '@/types/proposed-changes';
import { Collapsible, Grid, ProposedChangesWrapper, Section } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionEquipment() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const scopeOption: ScopeOption = 'stop';

	//
	// B. Render components

	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section>
				<Grid columns="abcd" gap="md">

					<ProposedChangesWrapper
						inputName="health_clinic"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Clínica" value="health_clinic" />
					</ProposedChangesWrapper>

					<ProposedChangesWrapper
						inputName="hospital"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Hospital" value="hospital" />
					</ProposedChangesWrapper>

					<ProposedChangesWrapper
						inputName="univeristy"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Universidade" value="university" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="school"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Escola" value="school" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="police_station"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Esquadra" value="police_station" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="fire_station"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Bombeiros" value="fire_station" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="commercial_area"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Zona Comercial" value="commercial_area" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="shopping"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Centro Comercial" value="shopping" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="historic_building"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Edifício Histórico" value="historic_building" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="transit_office"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Espaço navegante®" value="transit_office" />
					</ProposedChangesWrapper>
					<ProposedChangesWrapper
						inputName="beach"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<FacilityCheckbox form={stopDetailContext.data.form} label="Praia" value="beach" />
					</ProposedChangesWrapper>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
