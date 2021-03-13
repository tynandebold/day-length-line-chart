#!/bin/bash

if [[ $(git status -s) ]]; then
  git add .
  git commit -am "update data"
  git push
fi
