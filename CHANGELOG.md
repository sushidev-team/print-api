# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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