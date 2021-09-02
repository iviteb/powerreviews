import React, { useContext, FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { ProductContext } from 'vtex.product-context'
import Stars from './components/Stars'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import { withApollo, Query } from 'react-apollo'
import { Link } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'
import AggregateStructuredData from './components/AggregateStructuredData'

interface Props {
  appSettings: Settings
}

const RatingSummary: FC<Props> = ({ appSettings }) => {
  const { product } = useContext(ProductContext)

  const writeReviewLink =
    appSettings && product
      ? `/new-review?pr_page_id=${product[appSettings.uniqueId]}`
      : ''

  if (!product) {
    return (
      <Summary
        loading
        writeReviewLink={writeReviewLink}
        rating={0}
        numberOfReviews={0}
        productUrl={''}
        productId={''}
        productName={''}
      />
    )
  }

  return (
    <Query
      query={queryRatingSummary}
      variables={{
        sort: 'Newest',
        page: 0,
        pageId: JSON.stringify({
          linkText: product.linkText,
          productId: product.productId,
          productReference: product.productReference,
        }),
        filter: 0,
      }}
    >
      {({ data, loading }: { data: any; loading: boolean }) => {
        const rollup =
          data && data.productReviews && data.productReviews.results[0].rollup
        const rating = rollup ? rollup.average_rating : 0
        const numberOfReviews = rollup ? rollup.review_count : 0
        return (
          <Summary
            loading={loading}
            writeReviewLink={writeReviewLink}
            rating={rating}
            numberOfReviews={numberOfReviews}
            productUrl={product.link}
            productId={product.productId}
            productName={product.name}
          />
        )
      }}
    </Query>
  )
}

interface SummaryProps {
  writeReviewLink: string
  rating: number
  numberOfReviews: number
  loading: boolean
  productUrl: string
  productId: string
  productName: string
}

const CSS_HANDLES = [
  'powerReviewsRatingSummary',
  'powerReviewsRatingSummaryAverage',
  'powerReviewsRatingSummaryWriteAReview',
] as const

const Summary: FC<SummaryProps> = ({
  writeReviewLink,
  loading,
  rating,
  numberOfReviews,
  productUrl,
  productId,
  productName,
}) => {
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div
      className={`${handles.powerReviewsRatingSummary} review__rating mw8 center mb5`}
    >
      <AggregateStructuredData
        productName={productName}
        productId={productId}
        productUrl={productUrl}
        average={rating}
        total={numberOfReviews}
      />
      <Stars rating={rating} />
      <a
        href="#all-reviews"
        className={`${handles.powerReviewsRatingSummaryAverage} review__rating--average mr4 dib c-muted-2 t-body f6-s`}
      >
        (
        <FormattedMessage
          id="store/power-reviews.numberOfReviews"
          values={{ number: numberOfReviews }}
        />
        )
      </a>
      {!loading ? (
        <Link
          className={`${handles.powerReviewsRatingSummaryWriteAReview} dib c-on-base t-body f6-s`}
          to={writeReviewLink}
        >
          <FormattedMessage id="store/power-reviews.writeAReview" />
        </Link>
      ) : null}
    </div>
  )
}

export default withApollo(RatingSummary)
