package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyIdValid(t *testing.T) {
	validationutils.CheckOptions(t, "agency_id", "001", standard.AgencyIdValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_id_valid": config}
	})
}
