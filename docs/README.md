# PowerReviews

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

The PowerReviews app provides a way to bring your PowerReviews content into your VTEX store. The app also implements the PowerReviews Checkout Beacon during checkout, sending customer purchase data to the PowerReviews platform.

## Configuration

### Step 1 - Defining the app settings

In your VTEX account's admin, perform the following actions:

1. Access the **Apps** section and then **My Apps**.
2. Select the **PowerReviews** app box.
3. Complete the following required fields in the Settings section:

- `App Key` - The API Key provided by PowerReviews.
- `Merchant ID` - Your unique PowerReviews merchant ID.
- `Merchant Group ID` - Your PowerReviews merchant group ID.
- `API Unique Id` - The product field used as the identifier (or pageId) on PowerReviews.

Optionally, the `Use Legacy Review Display Component` checkbox allows you to use the PowerReviews Review Display component instead of the VTEX Reviews component.

If needed, provide a URL path to a CSS stylesheet to override the styles of the PowerReviews Write-a-Review, Questions & Answers, or Review Display components.

### Step 2 - Update your store theme

1. Add the `powerreviews` app as a `peerDependency` in your theme's `manifest.json` file:

```diff
 "peerDependencies": {
+  "vtex.powerreviews": "2.x"
 }
```

2. If not already present, add the following to your theme's `dependencies`:

```json
 "vtex.product-review-interfaces": "1.x",
 "vtex.product-summary-context": "0.x",
 "vtex.product-context": "0.x",
 "vtex.store-header": "2.x",
 "vtex.pixel-interfaces": "1.x",
 "vtex.store-image": "0.x",
```

### Step 3 - Defining the app's blocks

The PowerReviews app integrates with the following store framework blocks.

| Block name                      | Description                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `product-reviews`               | Display a paginated list of reviews for the product being viewed. This must be placed on the `store.product` page.       |
| `product-rating-summary`        | Display the average rating for the product being viewed. This must be placed on the `store.product` page.                |
| `product-rating-inline`         | Display the average rating for the product being, intended for use on the product shelf. viewed.                         |
| `product-review-form`           | Display the PowerReviews Write-a-Review form component. This must be placed on the `product-review-form` page.parameter. |
| `product-questions-and-answers` | Display the PowerReviews Questions & Answers component for the product being viewed.                                     |

An example of the blocks above in use:

```
 "store.product": {
   "blocks": [
     "product-rating-summary",
     "product-reviews",
     "product-questions-and-answers"
   ]
 }
```

```
 "store.product-review-form": {
   "blocks": [
     "product-review-form"
   ]
 }
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!
