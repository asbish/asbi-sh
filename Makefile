site: build_site

all: pre_process build

pre_process:
	@yarn install

build: build_contents build_site

build_contents:
	@yarn build

build_site:
	@stack build
	@stack exec site clean
	@stack exec site build

watch_site:
	@stack build
	@stack exec site clean
	@stack exec site watch

clean:
	@yarn clean
	@stack exec site clean

.PHONY: build_contents build_site watch pre_process clean
