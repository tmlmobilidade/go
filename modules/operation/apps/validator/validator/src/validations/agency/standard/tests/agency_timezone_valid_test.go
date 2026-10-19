package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyTimezoneValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_timezone", "Europe/Lisbon", "Not/A_Timezone", true, checks.AgencyTimezoneValid, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_timezone_valid": config}}}
	})
}
