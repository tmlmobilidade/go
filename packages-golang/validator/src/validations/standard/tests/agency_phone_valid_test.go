package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyPhoneValid(t *testing.T) {
	validationutils.CheckFormat(t, "agency_phone", "+351210000000", "invalid", false, standard.AgencyPhoneValid, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_phone_valid": config}
	})
}
