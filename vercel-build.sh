#!/bin/bash
# Script para compilar en Vercel sin ESLint
export DISABLE_ESLINT_PLUGIN=true
export NEXT_DISABLE_ESLINT=1
npm run build --no-lint
