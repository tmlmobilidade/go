APP_NAME := gtfs-validator
MAIN_PKG := ./
BIN_DIR := ../../../../../bin

.PHONY: all build run test clean help

all: build

build:
	mkdir -p $(BIN_DIR)
	go build -o $(BIN_DIR)/$(APP_NAME) $(MAIN_PKG)

run: build
	$(BIN_DIR)/$(APP_NAME) $(ARGS)

dev:
	go run main.go version.go -out=output.json -rules=../tml-rules.json -lang=pt -log=debug --input=$(INPUT)
test:
	go test ./...

clean:
	rm -f $(BIN_DIR)/$(APP_NAME)

help:
	@echo "Available targets:"
	@echo "  make build        Build the validator binary to bin/$(APP_NAME)"
	@echo "  make run ARGS='...'  Build and run with extra CLI arguments"
	@echo "  make test         Run Go tests"
	@echo "  make clean        Remove build artifacts"
