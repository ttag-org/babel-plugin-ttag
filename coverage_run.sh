set -e
export PATH=`pwd`/node_modules/.bin:$PATH
export NODE_PATH=`pwd`:$NODE_MODULES

echo "functional tests run"

# Runs all tests inside tests/functional
ls tests/functional | \
 tr '\n' '\0' | \
 xargs -0 -n1 -I {} istanbul cover ./node_modules/mocha/bin/_mocha --dir coverage/fun_{} -- -r @babel/register ./tests/functional/{}

echo "unit tests run"

# Runs all unit tests
istanbul cover ./node_modules/mocha/bin/_mocha --dir coverage/unit -- -r @babel/register ./tests/unit

# Merges report
istanbul report
