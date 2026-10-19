package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyFareUrlValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_fare_url", "https://example.com/fares", "invalid", false, checks.AgencyFareUrlValid, func(config types.RuleConfig) *types.AgencyRules {
		return &types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_fare_url_valid": config}}}
	})
}
