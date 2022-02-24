import React, { useContext, useEffect, useState } from 'react'
import { ProductContext } from 'vtex.product-context'
import { useRuntime } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'
import useShouldRenderComponent from './modules/useShouldRenderComponent'

const CSS_HANDLES = ['legacyReviewDisplay'] as const

const LegacyReviews = ({ appSettings }: { appSettings: Settings }) => {
  const handles = useCssHandles(CSS_HANDLES)
  const [isComponentLoaded, setComponentLoaded] = useState(false)
  const [refProd, setRefProd] = useState(null)

  const {
    culture: { locale },
  } = useRuntime()
  const { product } = useContext(ProductContext)
  const {
    appKey,
    merchantId,
    merchantGroupId,
    legacyReviewsStyleSheetSrc = '',
  } = appSettings

  const shouldRenderComponent = useShouldRenderComponent({
    appKey,
    locale,
    merchantGroupId,
    merchantId,
    appSettings,
    product,
  })

  useEffect(() => {
    if (
      shouldRenderComponent &&
      (!isComponentLoaded || product.productId !== refProd)
    ) {
      if (product.productId !== refProd) {
        const container = document.getElementById('pr-reviewdisplay')
        if (container) {
          container.innerHTML = ''
        }
      }
      /* eslint-disable @typescript-eslint/camelcase */
      window.POWERREVIEWS.display.render({
        api_key: appKey,
        locale: locale.replace('-', '_'),
        merchant_group_id: merchantGroupId,
        merchant_id: merchantId,
        page_id: product[appSettings.uniqueId],
        style_sheet: legacyReviewsStyleSheetSrc,
        review_wrapper_url: `/new-review?pr_page_id=${
          product[appSettings.uniqueId]
        }`,
        components: {
          ReviewDisplay: 'pr-reviewdisplay',
        },
      })
      setComponentLoaded(true)
      setRefProd(product.productId)
    }
  }, [
    shouldRenderComponent,
    isComponentLoaded,
    appKey,
    locale,
    merchantGroupId,
    merchantId,
    product,
    appSettings.uniqueId,
    legacyReviewsStyleSheetSrc,
    refProd,
  ])

  return <div className={handles.legacyReviewDisplay} id="pr-reviewdisplay" />
}

export default LegacyReviews
