build_site:
	@stack build
	@stack exec site clean
	@stack exec site build

build_contents:
	@yarn build

watch_site:
	@stack build
	@stack exec site clean
	@stack exec site watch

pre_process:
	@yarn install

clean:
	@yarn clean
	@stack exec site clean

all: pre_process build_contents build_site

.PHONY: build_site build_contents watch_site pre_process clean
