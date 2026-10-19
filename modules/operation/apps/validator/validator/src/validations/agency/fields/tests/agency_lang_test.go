package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyLangField(t *testing.T) {
	testutils.CheckPresence(t, "agency_lang", checks.AgencyLangField, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_lang_field": config}}}
	})
}
