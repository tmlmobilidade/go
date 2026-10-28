package agency_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyUrlValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_url", "https://example.com", "invalid", false, checks.AgencyUrlValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_url_valid": config}
	})
}
