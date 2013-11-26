run: install
	@echo "Starting application..."
	@node index

install:
	@echo "Installing dependencies..."
	@npm install
	@echo "Done.\n"

clean:
	@echo "Removing dependencies..."
	@rm -rf node_modules
	@echo "Done.\n"

.PHONY: clean
