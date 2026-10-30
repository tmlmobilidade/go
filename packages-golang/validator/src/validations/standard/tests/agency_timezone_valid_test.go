package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyTimezoneValid(t *testing.T) {
	validationutils.CheckFormat(t, "agency_timezone", "Europe/Lisbon", "Not/A_Timezone", true, standard.AgencyTimezoneValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_timezone_valid": config}
	})
}
