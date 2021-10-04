set -e # If any stage fails, don't continue.
sh build.sh
cd ./server
cargo run