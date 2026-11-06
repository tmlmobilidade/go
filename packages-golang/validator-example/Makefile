APP_NAME := gtfs-validator
MODULE_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
MAIN_PKG := $(MODULE_DIR)/src
BIN_DIR ?= $(MODULE_DIR)/dist
RULES ?= $(MODULE_DIR)/rules.json
OUTPUT ?= $(MODULE_DIR)/src/output.json
RULES_LANG ?= pt
LOG_LEVEL ?= debug

VALIDATION_ARGS = -rules="$(RULES)" -out="$(OUTPUT)" -lang="$(RULES_LANG)" -log="$(LOG_LEVEL)"

.PHONY: all build run dev test clean help

all: build

build:
	mkdir -p "$(BIN_DIR)"
	go build -o "$(BIN_DIR)/$(APP_NAME)" "$(MAIN_PKG)"

run: COMMAND = "$(BIN_DIR)/$(APP_NAME)"
run: build

dev: COMMAND = go run "$(MAIN_PKG)"

run dev:
	@set -eu; \
	input_path="$(INPUT)"; \
	if [ -z "$$input_path" ]; then \
		echo "Usage: make $@ INPUT=/path/to/feed.zip (or feed.sqlite)" >&2; \
		exit 1; \
	fi; \
	if [ ! -f "$$input_path" ]; then \
		echo "Input file not found: $$input_path (relative to $$(pwd))" >&2; \
		exit 1; \
	fi; \
	input_path="$$(cd -- "$$(dirname -- "$$input_path")" && pwd)/$$(basename -- "$$input_path")"; \
	temporary_directory=""; \
	trap '[ -z "$$temporary_directory" ] || rm -rf -- "$$temporary_directory"' EXIT; \
	trap 'exit 130' INT; \
	trap 'exit 143' TERM; \
	case "$$input_path" in \
		*.[zZ][iI][pP]) \
			temporary_directory="$$(mktemp -d "$${TMPDIR:-/tmp}/validator-gtfs.XXXXXX")"; \
			echo "Importing GTFS ZIP into temporary SQLite..." >&2; \
			(cd "$(MODULE_DIR)/../import-gtfs" && go run ./src/cli.go -path "$$input_path" -instance-path "$$temporary_directory/gtfs.sqlite" > /dev/null); \
			input_path="$$temporary_directory/gtfs.sqlite"; \
			;; \
	esac; \
	$(COMMAND) $(VALIDATION_ARGS) $(ARGS) -input="$$input_path"

test:
	cd "$(MODULE_DIR)" && go test ./...

clean:
	rm -f "$(BIN_DIR)/$(APP_NAME)"

help:
	@echo "Available targets:"
	@echo "  make build        Build the validator binary to $(BIN_DIR)/$(APP_NAME)"
	@echo "  make dev INPUT='/path/feed.zip'  Import ZIP if needed, then run the configured rules"
	@echo "  make run INPUT='/path/feed.sqlite'  Build and run; accepts ZIP or SQLite"
	@echo "  make test         Run Go tests"
	@echo "  make clean        Remove build artifacts"
	@echo "Defaults: RULES=$(RULES) OUTPUT=$(OUTPUT) RULES_LANG=$(RULES_LANG) LOG_LEVEL=$(LOG_LEVEL)"
	@echo "Override these variables or pass extra CLI flags with ARGS='...'."
	@echo "INPUT and overridden paths are relative to the directory where make runs."
