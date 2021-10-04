set -e # If any stage fails, don't continue.
cd ./client
npm i
npm run build-dev
cd ../server
cargo build