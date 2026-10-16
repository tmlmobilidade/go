package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyTimezoneValid(t *testing.T) {
	testutils.CheckValue(t, "agency_timezone", "Europe/Lisbon", "Not/A_Timezone", checks.AgencyTimezoneValid, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{AgencyTimezoneValid: config}
	})
}
