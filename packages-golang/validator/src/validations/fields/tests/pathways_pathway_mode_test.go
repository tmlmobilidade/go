package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestPathwayModeField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "pathway_mode", fields.PathwayModeField)
}
