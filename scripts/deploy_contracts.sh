#!/bin/bash

# Compile and deploy contracts to local blockchain
echo "Compiling contracts..."
truffle compile

echo "Deploying contracts to local blockchain..."
truffle migrate --reset --network development

echo "Contracts deployed successfully!"
