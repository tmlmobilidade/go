package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyEmailValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_email", "support@example.com", "invalid", false, checks.AgencyEmailValid, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{AgencyEmailValid: config}
	})
}
