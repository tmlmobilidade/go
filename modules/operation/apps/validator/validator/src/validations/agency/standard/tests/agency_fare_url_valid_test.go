package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyFareUrlValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_fare_url", "https://example.com/fares", "invalid", false, checks.AgencyFareUrlValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_fare_url_valid": config}
	})
}
