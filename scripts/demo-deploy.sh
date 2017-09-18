#!/bin/bash
# http://www.steveklabnik.com/automatically_update_github_pages_with_travis_example/

set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

cd demo/build

git init
git config user.name "Travis CI"
git config user.email "tra@vi.s"

git remote add upstream "https://$GH_TOKEN@github.com/zurfyx/eddystone-web-bluetooth.git"
git fetch upstream
git reset upstream/gh-pages

touch .

git add -A .
git commit -m "rebuild pages at ${rev}" --allow-empty
git push -q upstream HEAD:gh-pages