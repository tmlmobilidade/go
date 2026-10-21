package agency_standard_test

import (
	"main/types"
	checks "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyLangValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_lang", "pt", "invalid", false, checks.AgencyLangValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_lang_valid": config}
	})
}
