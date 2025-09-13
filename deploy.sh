#!/bin/bash

echo "Stopping and removing existing containers, networks, and volumes..."
docker-compose down

echo "Building and starting new containers in detached mode..."
docker-compose up -d --build

echo "Deployment complete."
