package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyIdField(t *testing.T) {
	testutils.CheckPresence(t, "agency_id", checks.AgencyIdField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_id_field": config}
	})
}
