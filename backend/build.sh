#!/bin/bash

# Ensure we're using pip for Python 3
python -m pip install --upgrade pip

# Install dependencies with explicit pip3 command
echo "Installing dependencies..."
pip3 install -r requirements.txt --no-cache-dir

echo "Build completed successfully!"
