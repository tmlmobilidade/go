package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyNameField(t *testing.T) {
	validationutils.AgencyCheckPresence(t, "agency_name", fields.AgencyNameField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_name_field": config}
	})
}
