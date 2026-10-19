package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyIdField(t *testing.T) {
	testutils.CheckPresence(t, "agency_id", checks.AgencyIdField, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_id_field": config}}}
	})
}
