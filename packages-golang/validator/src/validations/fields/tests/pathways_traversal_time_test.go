package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestTraversalTimeField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "traversal_time", fields.TraversalTimeField)
}
