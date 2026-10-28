package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyPhoneValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_phone", "+351210000000", "invalid", false, checks.AgencyPhoneValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_phone_valid": config}
	})
}
