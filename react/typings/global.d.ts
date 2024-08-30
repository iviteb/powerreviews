interface Window extends Window {
  __powerReviews: {
    appKey: string
    merchantId: string
    merchantGroupId: string
    uniqueId: string
  }
  POWERREVIEWS: PowerReviewsClient
  __RUNTIME__: {
    rootPath: string
  }
}

declare namespace NodeJS {
  interface Global extends Global {
    __hostname__: string
    __pathname__: string
    __RUNTIME__: {
      rootPath: string
    }
  }
}

interface Settings {
  appKey: string
  merchantId: string
  merchantGroupId: string
  uniqueId: 'productId' | 'linkText' | 'productReference'
  reviewFormStyleSheetSrc: string
  qnaStyleSheetSrc: string
  legacyReviewsStyleSheetSrc: string
}

// Docs: https://help.powerreviews.com/Content/Post%20Purchase%20Email/Checkout%20Beacon.htm
interface PowerReviewsClient {
  display: {
    render: (params: PowerReviewsRenderParams) => void
  }
  tracker: {
    createTracker: (params: { merchantGroupId: string }) => PowerReviewsTracker
  }
}

interface PowerReviewsTracker {
  trackCheckout: (orderFeed: OrderFeed) => void
}

interface OrderFeed {
  merchantGroupId: string
  merchantId: string
  locale: string
  merchantUserId?: string
  marketingOptIn: boolean
  userEmail: string
  userFirstName: string
  userLastName: string
  orderId: string
  orderSubtotal: number
  orderNumberOfItems: number
  orderItems: OrderFeedItem[]
}

interface OrderFeedItem {
  page_id: string
  page_id_variant?: string
  product_name?: string
  quantity: number
  unit_price: number
}

interface PowerReviewsRenderParams {
  api_key: string
  locale: string
  merchant_group_id: string
  merchant_id: string
  page_id: string
  components?: any
  product?: PowerReviewsProduct
  style_sheet?: string
  review_wrapper_url?: string
}

interface PowerReviewsProduct {
  name?: string
  url?: string
  image_url?: string
  description?: string
  category_name?: string
  upc?: string
  manufacturer_id?: string
  brand_name?: string
  price?: string | number
  in_stock?: boolean
  variants?: PowerReviewsProduct[]
}
