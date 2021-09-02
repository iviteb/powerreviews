import React, { FC } from 'react'

interface Review {
  Rating: number
  UserNickname: string
  ReviewText: string
  SubmissionTime: string
}

interface Props {
  productName: string
  productId: string
  productUrl: string
  reviews: Review[]
}

const ReviewStructuredData: FC<Props> = ({
  productName,
  productId,
  productUrl,
  reviews,
}) => {
  const reviewsListStructured = reviews.map(review => {
    const date = new Date(parseInt(review.SubmissionTime))
    const datePubished =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    return {
      '@type': 'Review',
      reviewRating: {
        ratingValue: `${review.Rating}`,
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: review.UserNickname || 'Anonymous',
      },
      datePublished: datePubished,
      reviewBody: review.ReviewText,
    }
  })

  const reviewStructuredData = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    mpn: productId,
    name: productName,
    review: reviewsListStructured,
  }
  // eslint-disable-next-line no-console
  console.log(reviewStructuredData)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewStructuredData) }}
    />
  )
}

export default ReviewStructuredData
