main_package_path ?= ./
binary_name ?= main
build_dir ?= ./bin
.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "Usage:"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

## build: build the native application
.PHONY: build
build:
	@mkdir -p ${build_dir}
	@go build -o ${build_dir}/${binary_name} ${main_package_path}

## clean: clean up the build binaries
.PHONY: clean
clean:
	@echo "Cleaning up..."
	@if [ -z "${build_dir}" ]; then \
		echo "build_dir is empty; refusing to clean."; \
		exit 1; \
	fi
	@rm -rf -- "${build_dir}"
