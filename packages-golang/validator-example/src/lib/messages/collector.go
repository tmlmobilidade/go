package messages

import (
	"sync"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
)

// MessageService collects findings safely across concurrent checks.
// Its state and methods share a package to keep synchronization private.
// The zero value is ready to use; create one collector for each validation run.
type MessageService struct {
	mu           sync.RWMutex
	issues       map[string]uint64
	errorCount   int
	warningCount int
	messages     []types.Message
}

var _ types.MessageService = (*MessageService)(nil)
