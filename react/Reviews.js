import React, {
  useContext,
  useEffect,
  useCallback,
  useReducer,
  useRef,
} from 'react'
import { ProductContext } from 'vtex.product-context'
import { Image } from 'vtex.store-image'
import { useCssHandles } from 'vtex.css-handles'
import LegacyReviews from './LegacyReviews'
import Stars from './components/Stars'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import voteReviewQuery from './graphql/mutations/voteReview.gql'
import { withApollo } from 'react-apollo'
import { FormattedMessage, useIntl, defineMessages } from 'react-intl'

import {
  IconSuccess,
  Pagination,
  Collapsible,
  Dropdown,
  Button,
} from 'vtex.styleguide'
import useFeedless from './modules/useFeedless'
import ReviewStructuredData from './components/ReviewStructuredData'

const IMAGES_URI_PREFIX = '//images.powerreviews.com'

const CSS_HANDLES = [
  'powerReviewsWrapper',
  'powerReviewsTitle',
  'powerReviewsRating',
  'powerReviewsAverage',
  'powerReviewsHistogram',
  'powerReviewsComments',
  'powerReviewsCommentsHead',
  'powerReviewsCommentsTitle',
  'powerReviewsFilters',
  'powerReviewsWriteAReviewContainer',
  'powerReviewsWriteAReview',
]

const messages = defineMessages({
  newest: { id: 'store/power-reviews.newest' },
  oldest: { id: 'store/power-reviews.oldest' },
  highestRating: { id: 'store/power-reviews.highestRating' },
  lowestRating: { id: 'store/power-reviews.lowestRating' },
  mostHelpful: { id: 'store/power-reviews.mostHelpful' },
  images: { id: 'store/power-reviews.images' },
  all: { id: 'store/power-reviews.all' },
  stars: { id: 'store/power-reviews.stars' },
  of: { id: 'store/power-reviews.of' },
})

const options = formatMessage => [
  {
    label: formatMessage(messages.newest),
    value: 'Newest',
  },
  {
    label: formatMessage(messages.oldest),
    value: 'Oldest',
  },
  {
    label: formatMessage(messages.highestRating),
    value: 'HighestRating',
  },
  {
    label: formatMessage(messages.lowestRating),
    value: 'LowestRating',
  },
  {
    label: formatMessage(messages.mostHelpful),
    value: 'MostHelpful',
  },
  {
    label: formatMessage(messages.images),
    value: 'MediaSort',
  },
]

const filters = formatMessage => [
  {
    label: formatMessage(messages.all),
    value: '0',
  },
  {
    label: formatMessage(messages.stars, { stars: 1 }),
    value: '1',
  },
  {
    label: formatMessage(messages.stars, { stars: 2 }),
    value: '2',
  },
  {
    label: formatMessage(messages.stars, { stars: 3 }),
    value: '3',
  },
  {
    label: formatMessage(messages.stars, { stars: 4 }),
    value: '4',
  },
  {
    label: formatMessage(messages.stars, { stars: 5 }),
    value: '5',
  },
]

const getTimeAgo = time => {
  let before = new Date(parseInt(time))
  let now = new Date()
  let diff = new Date(now - before)

  let minutes = diff.getUTCMinutes()
  let hours = diff.getUTCHours()
  let days = diff.getUTCDate() - 1
  let months = diff.getUTCMonth()
  let years = diff.getUTCFullYear() - 1970

  if (years != 0) {
    return (
      <FormattedMessage id="store/power-reviews.yearsAgo" values={{ years }} />
    )
  } else if (months != 0) {
    return (
      <FormattedMessage
        id="store/power-reviews.monthsAgo"
        values={{ months }}
      />
    )
  } else if (days != 0) {
    return (
      <FormattedMessage id="store/power-reviews.daysAgo" values={{ days }} />
    )
  } else if (hours != 0) {
    return (
      <FormattedMessage id="store/power-reviews.hoursAgo" values={{ hours }} />
    )
  } else {
    return (
      <FormattedMessage
        id="store/power-reviews.minutesAgo"
        values={{ minutes }}
      />
    )
  }
}

const initialState = {
  reviews: null,
  average: 0,
  histogram: [],
  count: 0,
  percentage: [],
  selected: 'Newest',
  filter: '0',
  paging: {},
  page: 0,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_REVIEWS': {
      return {
        ...state,
        reviews: action.reviews,
        average: action.average,
        histogram: action.histogram,
        percentage: action.percentage,
        count: action.count,
        paging: action.paging,
      }
    }
    case 'SET_SELECTED_SORT': {
      return {
        ...state,
        selected: action.selectedSort,
      }
    }
    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.filter,
        page: 0,
      }
    }
    case 'SET_NEXT_PAGE': {
      return {
        ...state,
        page: state.paging.current_page_number * 10,
      }
    }
    case 'SET_PREVIOUS_PAGE': {
      return {
        ...state,
        page: (state.paging.current_page_number - 2) * 10,
      }
    }
    case 'VOTE_REVIEW': {
      return {
        ...state,
        reviews: state.reviews.map((review, index) => {
          if (index === action.reviewIndex) {
            const types = {
              unhelpful: 'not_helpful_votes',
              helpful: 'helpful_votes',
            }
            const metricsType = types[action.voteType]

            return {
              ...review,
              disabled: true,
              metrics: {
                ...review.metrics,
                [metricsType]: (review.metrics[metricsType] += 1),
              },
            }
          }

          return review
        }),
      }
    }
    case 'TOGGLE_REVIEW_DETAILS': {
      return {
        ...state,
        reviews: state.reviews.map((review, index) => {
          if (index === action.reviewIndex) {
            return {
              ...review,
              showDetails: !review.showDetails,
            }
          }

          return review
        }),
      }
    }
  }
}

const ReviewsContainer = props => {
  const config = props.appSettings ? props.appSettings : {}

  if (config.useLegacyReviews) {
    return <LegacyReviews {...props} />
  }

  return <Reviews {...props} />
}

const Reviews = props => {
  const handles = useCssHandles(CSS_HANDLES)
  const { product } = useContext(ProductContext)
  const { formatMessage } = useIntl()
  const { linkText, productId, productReference } = product || {}
  const variablesRef = useRef()

  const [state, dispatch] = useReducer(reducer, initialState)
  const { filter, selected, page, count, histogram, average } = state

  const config = props.appSettings ? props.appSettings : {}

  useFeedless(config)

  useEffect(() => {
    if (!linkText && !productId && !productReference) {
      return
    }

    const variables = {
      sort: selected,
      page: page,
      pageId: JSON.stringify({
        linkText: linkText,
        productId: productId,
        productReference: productReference,
      }),
      filter: parseInt(filter) || 0,
    }

    // Stop. We are fetching the same thing. Avoid infinite loop.
    if (variablesRef.current === JSON.stringify(variables)) {
      return
    }
    variablesRef.current = JSON.stringify(variables)

    props.client
      .query({
        query: queryRatingSummary,
        variables,
      })
      .then(response => {
        // revisar se sempre vem 1 item nesse array
        const reviews = response.data.productReviews.results[0].reviews
        const rollup = response.data.productReviews.results[0].rollup
        const paging = response.data.productReviews.paging

        const hasNewHistogram = rollup != null && rollup.rating_histogram
        const currentHistogram = hasNewHistogram
          ? rollup.rating_histogram
          : histogram

        const hasNewCount = rollup != null && rollup.review_count != null
        const currentCount = hasNewCount ? rollup.review_count : count

        const hasNewAverage = rollup != null && rollup.average_rating != null
        const currentAverage = hasNewAverage ? rollup.average_rating : average

        let percentage = []
        currentHistogram.forEach(val => {
          percentage.push(((100 / currentCount) * val).toFixed(2) + '%') // cálculo de porcentagem
        })
        percentage.reverse() // o layout começa no 5, por isso do .reverse()

        dispatch({
          type: 'SET_REVIEWS',
          reviews,
          average: currentAverage,
          histogram: currentHistogram,
          count: currentCount,
          paging,
          percentage,
        })
      })
  }, [
    filter,
    selected,
    page,
    count,
    histogram,
    average,
    linkText,
    productId,
    productReference,
    props.client,
  ])

  const voteReview = useCallback(
    (reviewId, voteType, reviewIndex) => {
      props.client
        .mutate({
          mutation: voteReviewQuery,
          variables: { reviewId: reviewId, voteType: voteType },
        })
        .then(() => {
          dispatch({
            type: 'VOTE_REVIEW',
            reviewIndex,
            voteType,
          })
        })
    },
    [props.client]
  )

  const handleSort = useCallback(
    (event, value) => {
      dispatch({
        type: 'SET_SELECTED_SORT',
        selectedSort: value,
      })
    },
    [dispatch]
  )

  const handleFilter = useCallback(
    (event, value) => {
      dispatch({
        type: 'SET_FILTER',
        filter: value,
      })
    },
    [dispatch]
  )

  const handleClickNext = useCallback(() => {
    dispatch({
      type: 'SET_NEXT_PAGE',
    })
  }, [dispatch])

  const handleClickPrevious = useCallback(() => {
    dispatch({
      type: 'SET_PREVIOUS_PAGE',
    })
  }, [dispatch])

  if (state.reviews === null) {
    return (
      <div className="review mw8 center ph5">
        <FormattedMessage id="store/power-reviews.loadingReviews" />
      </div>
    )
  }

  const formattedOptions = options(formatMessage)

  const formattedFilters = filters(formatMessage)

  //Schema.org's reviews structure
  const reviewsList = state.reviews.map(review => ({
    Rating: review.metrics.rating,
    UserNickname: review.details.nickname,
    ReviewText: review.details.comments,
    SubmissionTime: review.details.created_date,
  }))

  return (
    <div
      className={`${handles.powerReviewsWrapper} review mw8 center ph5`}
      id="all-reviews"
    >
      {reviewsList.length > 0 ? (
        <ReviewStructuredData
          productName={product.productName}
          productId={product.productId}
          productUrl={product.link}
          reviews={reviewsList}
        />
      ) : null}
      <h3
        className={`${handles.powerReviewsTitle} review__title t-heading-3 bb b--muted-5 mb5`}
      >
        <FormattedMessage id="store/power-reviews.reviews" />
      </h3>
      <div className={`${handles.powerReviewsRating} review__rating`}>
        <Stars rating={state.average} />
        <span
          className={`${handles.powerReviewsAverage} review__rating--average dib v-mid`}
        >
          {average}
        </span>
      </div>
      {state.reviews.length > 0 && (
        <div className={`${handles.powerReviewsHistogram} review__histogram`}>
          <ul className="bg-muted-5 pa7 list">
            {state.percentage.map((percentage, i) => {
              return (
                <li key={i} className="mv3">
                  <span className="dib w-10 v-mid">
                    <FormattedMessage
                      id="store/power-reviews.stars"
                      values={{ stars: 5 - i }}
                    />
                  </span>
                  <div className="review__histogram--bar bg-white dib h2 w-90 v-mid">
                    <div
                      className="review__histogram--bar-value h2 bg-yellow"
                      style={{ width: percentage }}
                    ></div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <div className={`${handles.powerReviewsComments} review__comments`}>
        <div
          className={`${handles.powerReviewsCommentsHead} review__comments_head`}
        >
          <h4
            className={`${handles.powerReviewsCommentsTitle} review__comments_title t-heading-4 bb b--muted-5 mb5 pb4`}
          >
            <FormattedMessage
              id="store/power-reviews.reviewedBy"
              values={{ count: state.count }}
            />
          </h4>
          <div className={`${handles.powerReviewsFilters} flex mb7`}>
            <div className="mr4">
              <Dropdown
                options={formattedOptions}
                onChange={handleSort}
                value={state.selected}
              />
            </div>
            <div className="">
              <Dropdown
                options={formattedFilters}
                onChange={handleFilter}
                value={state.filter}
              />
            </div>
          </div>

          <div className={`${handles.powerReviewsWriteAReviewContainer} mv5`}>
            <a
              className={handles.powerReviewsWriteAReview}
              href={`/new-review?pr_page_id=${
                product[props.appSettings.uniqueId]
              }`}
            >
              {' '}
              <FormattedMessage id="store/power-reviews.writeAReview" />{' '}
            </a>
          </div>
        </div>

        {state.reviews.length === 0 && (
          <div className="review__comment bw2 bb b--muted-5 mb5 pb4">
            <h5 className="review__comment--user lh-copy mw9 t-heading-5 mv5">
              <FormattedMessage id="store/power-reviews.noReviews" />
            </h5>
          </div>
        )}

        {state.reviews.length > 0 &&
          state.reviews.map((review, i) => {
            return (
              <div
                key={i}
                className="review__comment bw2 bb b--muted-5 mb5 pb4"
              >
                <div className="review__comment--rating">
                  {[0, 1, 2, 3, 4].map((_, j) => {
                    return (
                      <svg
                        className="mr3"
                        key={j}
                        xmlns="http://www.w3.org/2000/svg"
                        width="14.737"
                        height="14"
                        fill={review.metrics.rating > j ? '#fc0' : '#eee'}
                        viewBox="0 0 14.737 14"
                      >
                        <path
                          d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                          transform="translate(0)"
                        />
                      </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
                    )
                  })}

                  <span>{review.metrics.rating}</span>
                </div>
                <h5 className="review__comment--user lh-copy mw9 t-heading-5 mv5">
                  {review.details.headline}
                </h5>
                {review.details.brand_base_url && (
                  <div className="flex items-center f6 c-muted-2 nt4">
                    <strong>
                      <FormattedMessage id="store/power-reviews.reviewedAt" />
                    </strong>
                    <Image
                      src={IMAGES_URI_PREFIX + review.details.brand_logo_uri}
                      alt={review.details.brand_base_url}
                      height={30}
                      link={{
                        url: review.details.brand_base_url,
                        noFollow: false,
                        openNewTab: true,
                        title: '',
                      }}
                    />
                  </div>
                )}
                <ul className="pa0">
                  {review.badges.is_verified_buyer ? (
                    <li className="dib mr5">
                      <IconSuccess />{' '}
                      <FormattedMessage id="store/power-reviews.verifiedBuyer" />
                    </li>
                  ) : null}
                  <li className="dib mr5">
                    <strong>
                      <FormattedMessage id="store/power-reviews.submitted" />
                    </strong>{' '}
                    {getTimeAgo(review.details.created_date)}
                  </li>
                  <li className="dib mr5">
                    <strong>
                      <FormattedMessage id="store/power-reviews.by" />
                    </strong>{' '}
                    {review.details.nickname}
                  </li>
                  <li className="dib">
                    <strong>
                      <FormattedMessage id="store/power-reviews.from" />
                    </strong>{' '}
                    {review.details.location}
                  </li>
                </ul>
                <p className="t-body lh-copy mw9">{review.details.comments}</p>
                <div>
                  <h5>
                    <FormattedMessage id="store/power-reviews.wasItHelpful" />
                  </h5>
                  <Button
                    disabled={review.disabled}
                    variation="primary"
                    size="small"
                    onClick={() => voteReview(review.review_id, 'helpful', i)}
                  >
                    <FormattedMessage
                      id="store/power-reviews.yes"
                      values={{ votes: review.metrics.helpful_votes }}
                    />
                  </Button>

                  <Button
                    disabled={review.disabled}
                    variation="danger-tertiary"
                    size="small"
                    onClick={() => voteReview(review.review_id, 'unhelpful', i)}
                  >
                    <FormattedMessage
                      id="store/power-reviews.no"
                      values={{ votes: review.metrics.not_helpful_votes }}
                    />
                  </Button>
                </div>

                <div className="review__comment_more-details mt6">
                  <Collapsible
                    header={
                      <span>
                        <FormattedMessage id="store/power-reviews.moreDetails" />
                      </span>
                    }
                    onClick={e => {
                      dispatch({
                        type: 'TOGGLE_REVIEW_DETAILS',
                        reviewIndex: i,
                      })
                    }}
                    isOpen={review.showDetails}
                  >
                    <div className="flex flex-wrap mt5 justify-between-s">
                      {review.details.properties.map((item, i) => {
                        return (
                          <div key={i} className="w30">
                            <h5 className="t-heading-5 ma0">{item.label}</h5>
                            {item.value.length ? (
                              <ul className="pa0 list">
                                {item.value.map((val, j) => {
                                  return <li key={j}>{val}</li>
                                })}
                              </ul>
                            ) : null}
                          </div>
                        )
                      })}
                      {review.details.bottom_line ? (
                        <div className="w30">
                          <h5 className="t-heading-5 ma0">
                            <FormattedMessage id="store/power-reviews.bottomLine" />
                          </h5>
                          <p>
                            <FormattedMessage
                              id="store/power-reviews.recommend"
                              values={{ recommend: review.details.bottom_line }}
                            />
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </Collapsible>
                </div>

                {review.media.length ? (
                  <div className="review__comment-images mt6">
                    {review.media.map((item, i) => {
                      return (
                        <img
                          alt=""
                          className="w-20 db mb5"
                          key={i}
                          src={item.uri}
                        />
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
      </div>
      {state.reviews.length > 0 && (
        <div className="review__paging">
          <Pagination
            textShowRows=""
            currentItemFrom={
              1 +
              (state.paging.current_page_number - 1) * state.paging.page_size
            }
            currentItemTo={
              state.paging.current_page_number * state.paging.page_size
            }
            textOf={formatMessage(messages.of)}
            totalItems={state.paging.total_results}
            onNextClick={handleClickNext}
            onPrevClick={handleClickPrevious}
          />
        </div>
      )}
    </div>
  )
}

export default withApollo(ReviewsContainer)
