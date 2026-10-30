package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyFareUrlValid(t *testing.T) {
	validationutils.CheckFormat(t, "agency_fare_url", "https://example.com/fares", "invalid", false, standard.AgencyFareUrlValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_fare_url_valid": config}
	})
}
