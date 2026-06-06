build:
	@bun run build

install:
	@bun install

publish:
	@bun publish --access public

version-minor:
	@bun pm version minor

version-patch:
	@bun pm version patch

version-major:
	@bun pm version major


push:
	@git add .
	@git commit -m "Update"
	@git push origin main

