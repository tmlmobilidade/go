package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyNameValid(t *testing.T) {
	testutils.CheckOptions(t, "agency_name", "Agency", checks.AgencyNameValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_name_valid": config}
	})
}
