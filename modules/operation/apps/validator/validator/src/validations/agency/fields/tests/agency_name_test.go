package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyNameField(t *testing.T) {
	testutils.CheckPresence(t, "agency_name", checks.AgencyNameField, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_name_field": config}}}
	})
}
