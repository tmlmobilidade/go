package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyIdValid(t *testing.T) {
	testutils.CheckOptions(t, "agency_id", "001", checks.AgencyIdValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_id_valid": config}
	})
}
