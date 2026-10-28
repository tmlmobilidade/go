package agency_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyFareUrlValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_fare_url", "https://example.com/fares", "invalid", false, checks.AgencyFareUrlValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_fare_url_valid": config}
	})
}
