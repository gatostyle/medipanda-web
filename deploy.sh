#!/bin/sh

set -e

DEV_SERVER_HOST="43.202.151.248"
DEV_DEPLOY_HOST="admin.dev.medipanda.co.kr"
PROD_SERVER_HOST="3.39.216.231"
PROD_DEPLOY_HOST="admin.medipanda.co.kr"

DEFAULT_LOCAL_DIRECTORY="./dist/"
DEFAULT_KEYFILE="$HOME/.ssh/medipanda/keys/medipanda.pem"

alias log.e='echo "[ERROR] "'
alias log.i='echo "[INFO]  "'

usage() {
  log.e "Usage: $0 [--help] [--dry-run] <--env dev|prod> [--keyfile <KEYFILE>] [LOCAL_DIRECTORY]" >&2
  exit 1
}

while [ "$OPTIND" -le "$#" ]; do
  case "$1" in
  --dry-run)
    DRY_RUN=1
    shift 1
    ;;
  --env)
    if [ "$2" = "dev" ]; then
      SERVER_HOST="$DEV_SERVER_HOST"
      DEPLOY_HOST="admin.dev.medipanda.co.kr"
      shift 2
    elif [ "$2" = "prod" ]; then
      SERVER_HOST="$PROD_SERVER_HOST"
      DEPLOY_HOST="admin.medipanda.co.kr"
      shift 2
    else
      log.e "Unknown environment: $2" >&2
      usage
    fi
    ;;
  --keyfile)
    KEYFILE="$2"
    shift 2
    ;;
  --help)
    usage
    ;;
  *)
    if [ -z "$LOCAL_DIRECTORY" ]; then
      LOCAL_DIRECTORY="$1"
      shift 1
    else
      log.e "Unknown option: $1" >&2
      usage
    fi
    ;;
  esac
done

if [ -z "$SERVER_HOST" ]; then
  log.e "Missing required argument: --env dev|prod" >&2
  usage
fi

if [ -z "$LOCAL_DIRECTORY" ]; then
  LOCAL_DIRECTORY="$DEFAULT_LOCAL_DIRECTORY"
  log.i "Using default LOCAL_DIRECTORY: $LOCAL_DIRECTORY"
fi

if [ -z "$KEYFILE" ]; then
  KEYFILE="$DEFAULT_KEYFILE"
  log.i "Using default KEYFILE: $KEYFILE"
fi

if [ ! -d "$LOCAL_DIRECTORY" ]; then
  log.e "Local directory does not exist: $LOCAL_DIRECTORY" >&2
  exit 1
fi

if [ ! -f "$KEYFILE" ]; then
  log.e "Key file does not exist: $KEYFILE" >&2
  exit 1
fi

if [ -n "$DRY_RUN" ]; then
  log.i "Running in dry-run mode. No files will be transferred."
fi

log.i "Deploying to $SERVER_HOST($DEPLOY_HOST) from $LOCAL_DIRECTORY using key $KEYFILE."
rsync $([ -n "$DRY_RUN" ] && echo "--dry-run") -azivh --delete -e "ssh -i $KEYFILE -o StrictHostKeyChecking=no" "$LOCAL_DIRECTORY"/ ec2-user@"$SERVER_HOST":"/var/sites/$DEPLOY_HOST/www/"
