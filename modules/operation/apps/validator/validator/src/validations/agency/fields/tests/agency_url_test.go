package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyUrlField(t *testing.T) {
	testutils.CheckPresence(t, "agency_url", checks.AgencyUrlField, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_url_field": config}}}
	})
}
