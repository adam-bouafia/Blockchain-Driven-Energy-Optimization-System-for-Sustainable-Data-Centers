#!/bin/bash

# Start local blockchain for development
echo "Starting local blockchain with Ganache CLI..."
ganache-cli --deterministic --mnemonic "test test test test test test test test test test test junk" --port 8545 --gasLimit 12000000
