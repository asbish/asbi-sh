all: pre_process build_pages build_site

pre_process:
	@yarn install

build_pages:
	@yarn build

build_site:
	@cabal build
	@cabal exec site clean
	@cabal exec site build

serve:
	@cabal build
	@cabal exec site watch

test:
	@yarn lint
	@yarn test

clean:
	@yarn clean
	@cabal exec site clean

.PHONY: all pre_process build_pages build_site watch_site test clean
