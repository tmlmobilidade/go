package agency_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyPhoneValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_phone", "+351210000000", "invalid", false, checks.AgencyPhoneValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_phone_valid": config}
	})
}
