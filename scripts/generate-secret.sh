#!/bin/bash

# Generate a secure random secret for Vercel CRON_SECRET
openssl rand -base64 32
