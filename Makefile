build:
	@bun run build

install:
	@bun install

publish:
	@bun publish --access public

push:
	@git add .
	@git commit -m "Update"
	@git push origin main