package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyNameValid(t *testing.T) {
	validationutils.CheckOptions(t, "agency_name", "Agency", standard.AgencyNameValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_name_valid": config}
	})
}
