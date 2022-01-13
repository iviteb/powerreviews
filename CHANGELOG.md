# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.1] - 2022-01-13
### Changed
- Use product's URI as @id on `Product` schema for `RatingSummary` and `Reviews` blocks.

## [2.3.0] - 2021-09-03

### Added

- Schema.org structured data for aggregateRating and reviews

## [2.2.1] - 2021-07-26

### Fixed

- Meta screenshot format
- Meta features descriptions

## [2.2.0] - 2021-07-15

### Fixed

- Update Node builder

## [2.1.3] - 2021-07-08

### Fixed

- Updated app store meta data and additional documentation

## [2.1.2] - 2021-07-08

### Fixed

- Update README

### Added

- Crowdin file

## [2.1.1] - 2021-03-03

### Fixed

- Legacy reviews component available through app setting rather than separate interface

## [2.1.0] - 2021-03-03

### Added

- Legacy reviews display store block

### Fixed

- Duplicate insertion of `power-reviews` script in the DOM
- Sometimes the Q&A block wasn't being rendered at all

## [2.0.0] - 2021-02-23

### Added

- Billing options
- App Store metadata

## [1.8.0] - 2021-01-18

### Added

- `reviewFormStyleSheetSrc` & `qnaStyleSheetSrc` appSettings for custom stylesheets for the QnA & ReviewForm components

## [1.7.0] - 2020-10-27

### Added

- Questions and Answers component.

## [1.6.0] - 2020-09-08

### Added

- CSS Handles

### Changed

- Use app settings instead of fetching them via GraphQL.

## [1.5.0] - 2020-09-02

### Added

- Internationalization.

## [1.4.4] - 2020-08-19

### Fixed

- Get reviews from locale.

## [1.4.3] - 2019-11-07

### Fixed

- Fix infinite loop on data-fetching.

## [1.4.2] - 2019-11-05

## [1.4.1] - 2019-10-31

### Changed

- Make Reviews query not be ssr.

## [1.4.0] - 2019-10-11

### Added

- `reviewed at` badge

## [1.3.2] - 2019-10-04

### Fixed

- Fixes error on useFeedless if product is not loaded yet/doesn't exist.

## [1.3.1] - 2019-09-25

## [1.3.0] - 2019-08-26

### Added

- Feedless integration

## [1.2.2] - 2019-07-30

### Fixed

- New review link

## [1.2.1] - 2019-07-18

### Fixed

- Add safeguard to avoid referencing undefined variable

## [1.2.0] - 2019-07-17

### Added

- Checkout Beacon

## [1.1.0] - 2019-07-12

### Added

- Anchor link to all reviews.

### Fixed

- Add safeguard if product is not loaded yet.

## [1.0.7] - 2019-07-11

### Fixed

- Use product-summary-context instead of deprecated product-summary.
- Number of reviews in RatingSummary.
- Add cache to GraphQL APIs.

## [1.0.6] - 2019-07-02

### Fixed

- Method of getting Reviews.

## [1.0.5] - 2019-06-19

## [1.0.4] - 2019-06-18

### Changed

- Rating summary layout.

## [1.0.3] - 2019-06-17

### Fixed

- Add app title and description.

## [1.0.2] - 2019-06-17

### Fixed

- Async requests.

## [1.0.1] - 2019-06-17

### Added

- Initial release.
