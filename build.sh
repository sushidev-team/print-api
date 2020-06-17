echo "Create docker image for print api";

DOCKERHOST="ambersive"
IMAGENAME="print-api"

root="$(pwd)"

if  [[ $root == */fastlane ]] ;
then
  BUILD=$(cat $root/../package.json \
  | grep versionNumber \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

  PACKAGE_VERSION=$(cat $root/../package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]')
else 
  BUILD=$(cat $root/package.json \
  | grep versionNumber \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

  PACKAGE_VERSION=$(cat $root/package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]')
fi

LATEST="${DOCKERHOST}/${IMAGENAME}:latest"
COMPLETE="${DOCKERHOST}/${IMAGENAME}:${PACKAGE_VERSION}"

arg1="$1"

if [[ "$(docker images -q ${COMPLETE} 2> /dev/null)" == "" ]]; then
  echo "Docker image for ${COMPLETE} does not exists on this maschine. Start creating it...";
  docker build -f "$root/dockerfile" -t ${COMPLETE} "${root}";
  docker push $COMPLETE;
fi

docker build -f "$root/dockerfile" -t ${LATEST} "${root}";
docker push $LATEST;

if [[ "${arg1}" == "--dev" ]]; then
  docker-compose -f $root/docker-compose.yml up -d
fi