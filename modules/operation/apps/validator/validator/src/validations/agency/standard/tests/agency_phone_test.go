package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyPhoneValid(t *testing.T) {
	testutils.CheckValue(t, "agency_phone", "+351210000000", "invalid", checks.AgencyPhoneValid, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{AgencyPhoneValid: config}
	})
}
