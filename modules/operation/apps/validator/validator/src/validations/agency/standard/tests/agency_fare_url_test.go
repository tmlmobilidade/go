package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyFareUrlValid(t *testing.T) {
	testutils.CheckValue(t, "agency_fare_url", "https://example.com/fares", "invalid", checks.AgencyFareUrlValid, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{AgencyFareUrlValid: config}
	})
}
