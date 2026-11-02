package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyLangValid(t *testing.T) {
	validationutils.CheckFormat(t, "agency_lang", "pt", "invalid", false, standard.AgencyLangValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_lang_valid": config}
	})
}
