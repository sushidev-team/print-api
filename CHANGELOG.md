# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2020-08-07
### Fixed
- Updated the dependencies (PR1)

### Added
- Healthcheck (/health)

### Changed
- Removed the old simple healthcheck.

## [0.3.0] - 2020-08-05
### Changed
- Instead of reading the filesystem the checks will run against a sqlite database

### Added
- Support for automatic delete after request
- Counting of downloads
- Support for sqlite
- Swagger Documentation (/api)

## [0.2.3] - 2020-07-30
### Added
- File entry will also return created_at and updated_at 

## [0.2.2] - 2020-07-30
### Fixed
- Fixed the docker-compose.yml file with correct environment variables.

### Added
- Added docker-compose-dev.yml for development and testing purpose.
- [DELETE] /browser/:id to delete files created by this endpoint.
- JWT: [DELETE] /browse/:id requires "browse-delete" as permission or a custom permission which can be addressed by setting the environment variable "PERMISSION_BROWSE_DELETE"

## [0.2.1] - 2020-07-29
### Fixed
- Remove .env file from repository

### Added
- Added example file for .env

## [0.2.0] - 2020-07-29
### Added
- Added [GET] /browse to get all files available on the print server.
- JWT: [GET] /browse requires "browse-read" as permission or a custom permission which can be addressed by setting the environment variable "PERMISSION_BROWSE_READ"

### Fixed
- Fixed http-protocol bug where links where always http.

### Changed
- JWT: [POST] /browse requires now the permission "browse-create" instead of "browse" or a custom permission which can be addressed by setting the environment variable "PERMISSION_BROWSE_CREATE"


## [0.1.2] - 2020-06-28
### Fixed
- Issue with decision if you want to use JWT or Basic Authentication
### Changed
- Refactored the auth.middleware to be more maintainable

## [0.1.1] - 2020-06-24
### Fixed
- Filename was not attached in the formbody  of the postback request.

## [0.1.0] - 2020-06-17
### Added
- Initial Support for PDF Print API 
- JWT Authentication
- Basic Auth