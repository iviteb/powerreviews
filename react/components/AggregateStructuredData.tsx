import React, { FC } from 'react'
import { getBaseUrl } from '../modules/baseUrl'

interface Props {
  productName: string
  productId: string
  productUrl: string
  average: number
  total: number
}

const AggregateStructuredData: FC<Props> = ({
  productName,
  productId,
  productUrl,
  average,
  total,
}) => {
  if (!total || total === 0 || !average) {
    return null
  }

  const baseUrl = getBaseUrl()

  const aggregate = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/${productUrl}/p`,
    mpn: productId,
    name: productName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: typeof average === 'number' ? average.toFixed(2) : average,
      reviewCount: total,
      bestRating: '5',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregate) }}
    />
  )
}

export default AggregateStructuredData
