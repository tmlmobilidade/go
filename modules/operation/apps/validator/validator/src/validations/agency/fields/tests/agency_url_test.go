package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyUrlField(t *testing.T) {
	testutils.CheckPresence(t, "agency_url", checks.AgencyUrlField, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{AgencyUrlField: config}
	})
}
