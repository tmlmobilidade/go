package agency_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyTimezoneValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_timezone", "Europe/Lisbon", "Not/A_Timezone", true, checks.AgencyTimezoneValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_timezone_valid": config}
	})
}
