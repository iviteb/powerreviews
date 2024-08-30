import React, { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import { useRuntime } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'
import { path } from 'ramda'
import { useQuery } from 'react-apollo'
import GET_SKU_QUERY from './graphql/queries/sku.gql'

import useShouldRenderComponent from './modules/useShouldRenderComponent'

const CSS_HANDLES = ['legacyReviewDisplay'] as const

const LegacyReviews = ({ appSettings }: { appSettings: Settings }) => {
  const handles = useCssHandles(CSS_HANDLES)
  const [isComponentLoaded, setComponentLoaded] = useState(false)
  const [refProd, setRefProd] = useState(null)

  const {
    culture: { locale },
  } = useRuntime()
  const { product, selectedItem } = useProduct()
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

  const { data, loading } = useQuery(GET_SKU_QUERY, {
    variables: {
      identifier: { field: 'id', value: selectedItem.itemId },
    },
    skip: !selectedItem.itemId,
    ssr: false,
  })

  const upc: string | undefined = path(['ean'], selectedItem)
  const manufacturerId: string | undefined = path(
    ['sku', 'manufacturerCode'],
    data
  )
  useEffect(() => {
    if (loading) {
      return
    }
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
        product: {
          upc,
          manufacturer_id: manufacturerId,
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
    loading,
    upc,
    manufacturerId,
  ])

  return <div className={handles.legacyReviewDisplay} id="pr-reviewdisplay" />
}

export default LegacyReviews
