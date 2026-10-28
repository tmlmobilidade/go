package agency_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyLangValid(t *testing.T) {
	testutils.CheckFormat(t, "agency_lang", "pt", "invalid", false, checks.AgencyLangValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_lang_valid": config}
	})
}
