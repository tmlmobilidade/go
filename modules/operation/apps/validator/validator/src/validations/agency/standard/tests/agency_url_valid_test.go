package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyUrlValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_url", "https://example.com", "invalid", false, checks.AgencyUrlValid, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{AgencyUrlValid: config}
	})
}
