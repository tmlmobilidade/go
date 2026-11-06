package validations_types

import (
	"sync"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
)

// Execution shares immutable inputs and one synchronized collector across workers.
// Only the scheduler owns rule statuses; workers record operational errors here.
type Execution struct {
	Messages messages.MessageService
	Mu       sync.Mutex
	Failures map[string]error
	Err      error // Combined technical errors; read after all workers finish
}
