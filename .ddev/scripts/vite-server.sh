#!/bin/bash
# Vite development server startup script

# Wait for npm dependencies to be available
while [ ! -d "node_modules" ]; do
  echo "Waiting for node_modules..."
  sleep 2
done

# Start Vite dev server
echo "Starting Vite dev server..."
npm run dev