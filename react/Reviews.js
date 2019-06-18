import React, { Component } from 'react'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import voteReviewQuery from './graphql/mutations/voteReview.gql'
import getConfig from './graphql/getConfig.graphql'
import { withApollo, graphql } from 'react-apollo'
import {
  IconSuccess,
  Pagination,
  Collapsible,
  Dropdown,
  Button,
} from 'vtex.styleguide'

let hasUpdated = false

class Reviews extends Component {
  constructor(props) {
    super(props)

    this.state = {
      reviews: [],
      average: 0,
      histogram: [],
      count: 0,
      percentage: [],
      options: [
        {
          label: 'Most Recent',
          value: 'Newest',
        },
        {
          label: 'Oldest',
          value: 'Oldest',
        },
        {
          label: 'Highest Rated',
          value: 'HighestRating',
        },
        {
          label: 'Lowest Rated',
          value: 'LowestRating',
        },
        {
          label: 'Most Helpful',
          value: 'MostHelpful',
        },
        {
          label: 'Images',
          value: 'MediaSort',
        },
      ],
      selected: 'Newest',
      filter: '0',
      filters: [
        {
          label: 'Select a filter...',
          value: '0',
        },
        {
          label: '1 star',
          value: '1',
        },
        {
          label: '2 stars',
          value: '2',
        },
        {
          label: '3 stars',
          value: '3',
        },
        {
          label: '4 stars',
          value: '4',
        },
        {
          label: '5 stars',
          value: '5',
        },
      ],
      paging: {},
      detailsIsOpen: false,
    }
  }

  calculatePercentage = () => {
    let { histogram, count } = this.state

    let arr = []

    histogram.forEach((val, i) => {
      arr.push(((100 / count) * val).toFixed(2) + '%') // cálculo de porcentagem
    })

    arr.reverse() // o layout começa no 5, por isso do .reverse()

    this.setState({ percentage: arr })
  }

  componentDidUpdate() {
    if (!hasUpdated) {
      if (!this.props.productQuery.loading && !this.props.data.loading) {
        this.getReviews('Newest')
        hasUpdated = true
      }
    }
  }

  getReviews(orderBy, page, filter) {
    this.props.client
      .query({
        query: queryRatingSummary,
        variables: {
          sort: orderBy,
          page: page || 0,
          pageId: JSON.stringify({
            linkText: this.props.productQuery.product.linkText,
            productId: this.props.productQuery.product.productId,
            productReference: this.props.productQuery.product.productReference,
          }),
          filter: parseInt(filter) || 0,
        },
      })
      .then(response => {
        let reviews = response.data.productReviews.results[0].reviews // revisar se sempre vem 1 item nesse array
        let rollup = response.data.productReviews.results[0].rollup
        let paging = response.data.productReviews.paging

        this.setState({
          reviews: reviews,
          average: rollup != null ? rollup.average_rating : 0,
          histogram: rollup != null ? rollup.rating_histogram : [],
          count: rollup != null ? rollup.review_count : 0,
          paging: paging,
        })

        this.calculatePercentage()
      })
  }

  handleSort = (event, value) => {
    this.setState({ selected: value })
    this.getReviews(value)
  }

  handleFilter = (event, value) => {
    const currentSort = this.state.selected
    const currentPage = 0

    this.setState({ filter: value })
    this.getReviews(currentSort, currentPage, value)
  }

  handleClickNext = () => {
    this.goToPage(this.state.paging.current_page_number * 10)
  }

  handleClickPrevious = () => {
    this.goToPage((this.state.paging.current_page_number - 2) * 10)
  }

  getTimeAgo = time => {
    let before = new Date(parseInt(time))
    let now = new Date()
    let diff = new Date(now - before)

    let minutes = diff.getUTCMinutes()
    let hours = diff.getUTCHours()
    let days = diff.getUTCDate() - 1
    let months = diff.getUTCMonth()
    let years = diff.getUTCFullYear() - 1970

    if (years != 0) {
      return `${years} ${years > 1 ? 'years' : 'year'} ago`
    } else if (months != 0) {
      return `${months} ${months > 1 ? 'months' : 'month'} ago`
    } else if (days != 0) {
      return `${days} ${days > 1 ? 'days' : 'day'} ago`
    } else if (hours != 0) {
      return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`
    } else {
      return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`
    }
  }

  goToPage(page) {
    let orderBy = this.state.selected
    const filter = this.state.filter

    this.props.client
      .query({
        query: queryRatingSummary,
        variables: {
          sort: orderBy,
          page: page || 0,
          pageId: JSON.stringify({
            linkText: this.props.productQuery.product.linkText,
            productId: this.props.productQuery.product.productId,
            productReference: this.props.productQuery.product.productReference,
          }),
          filter: parseInt(filter) || 0,
        },
      })
      .then(response => {
        // eslint-disable-next-line no-console
        console.log('response goToPage', response)
        let reviews = response.data.productReviews.results[0].reviews // revisar se sempre vem 1 item nesse array
        // let rollup = response.data.productReviews.results[0].rollup;
        let paging = response.data.productReviews.paging

        this.setState({
          reviews: reviews,
          paging: paging,
        })
      })
  }

  voteReview(reviewId, voteType, reviewIndex) {
    this.props.client
      .mutate({
        mutation: voteReviewQuery,
        variables: { reviewId: reviewId, voteType: voteType },
      })
      .then(response => {
        // eslint-disable-next-line no-console
        console.log(response)

        const types = {
          unhelpful: 'not_helpful_votes',
          helpful: 'helpful_votes',
        }
        const metricsType = types[voteType]

        let reviews = this.state.reviews
        let review = this.state.reviews[reviewIndex]
        review.metrics[metricsType] += 1
        review.disabled = true
        reviews[reviewIndex] = review

        this.setState({
          reviews: reviews,
        })
      })
  }

  render() {
    return this.state.reviews.length ? (
      <div className="review mw8 center ph5">
        <h3 className="review__title t-heading-3 bb b--muted-5 mb5">Reviews</h3>
        <div className="review__rating">
          <div className="review__rating--stars dib relative v-mid mr2">
            <div className="review__rating--inactive nowrap">
              {[0, 1, 2, 3, 4].map((_, i) => {
                return i <= 3 ? (
                  <svg
                    className="mr2"
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={'#eee'}
                    viewBox="0 0 14.737 14"
                  >
                    <path
                      d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                      transform="translate(0)"
                    />
                  </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
                ) : (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={'#eee'}
                    viewBox="0 0 14.737 14"
                  >
                    <path
                      d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                      transform="translate(0)"
                    />
                  </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
                )
              })}
            </div>
            <div
              className="review__rating--active nowrap overflow-hidden absolute top-0-s left-0-s"
              style={{ width: this.state.average * 20 + '%' }}
            >
              {[0, 1, 2, 3, 4].map((_, i) => {
                let { average } = this.state

                return i <= 3 ? (
                  <svg
                    className="mr2"
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={average > i ? '#fc0' : '#eee'}
                    viewBox="0 0 14.737 14"
                  >
                    <path
                      d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                      transform="translate(0)"
                    />
                  </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
                ) : (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={average > i ? '#fc0' : '#eee'}
                    viewBox="0 0 14.737 14"
                  >
                    <path
                      d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                      transform="translate(0)"
                    />
                  </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
                )
              })}
            </div>
          </div>
          <span className="review__rating--average dib v-mid">
            {this.state.average.toFixed(1)}
          </span>
        </div>
        <div className="review__histogram">
          <ul className="bg-muted-5 pa7 list">
            {this.state.percentage.map((percentage, i) => {
              return (
                <li key={i} className="mv3">
                  <span className="dib w-10 v-mid">
                    {5 - i} {i < 4 ? 'stars' : 'star'}
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
        <div className="review__comments">
          <div className="review__comments_head">
            <h4 className="review__comments_title t-heading-4 bb b--muted-5 mb5 pb4">
              Reviewed by {this.state.count}{' '}
              {this.state.count == 1 ? 'customer' : 'customers'}
            </h4>
            <div className="mb7">
              <Dropdown
                options={this.state.options}
                onChange={this.handleSort}
                value={this.state.selected}
                {...this.props}
              />
            </div>
            <div className="mb7">
              <Dropdown
                options={this.state.filters}
                onChange={this.handleFilter}
                value={this.state.filter}
                {...this.props}
              />
            </div>

            <div className="mv5">
              {!this.props.data.loading && !this.props.productQuery.loading ? (
                <a
                  href={`/new-review?pr_page_id=${
                    this.props.productQuery.product[
                      this.props.data.getConfig.uniqueId
                    ]
                  }&pr_merchant_id=${
                    this.props.data.getConfig.merchantId
                  }&pr_api_key=${
                    this.props.data.getConfig.appKey
                  }&pr_merchant_group_id=${
                    this.props.data.getConfig.merchantGroupId
                  }`}
                >
                  {' '}
                  Write a review{' '}
                </a>
              ) : null}
            </div>
          </div>

          {this.state.reviews.map((review, i) => {
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
                <ul className="pa0">
                  {review.badges.is_verified_buyer ? (
                    <li className="dib mr5">
                      <IconSuccess /> Verified buyer
                    </li>
                  ) : null}
                  <li className="dib mr5">
                    <strong>Submitted</strong>{' '}
                    {this.getTimeAgo(review.details.created_date)}
                  </li>
                  <li className="dib mr5">
                    <strong>By</strong> {review.details.nickname}
                  </li>
                  <li className="dib">
                    <strong>From</strong> {review.details.location}
                  </li>
                </ul>
                <p className="t-body lh-copy mw9">{review.details.comments}</p>
                <div>
                  <h5>Was this review helpful to you?</h5>
                  <Button
                    disabled={review.disabled}
                    variation="primary"
                    size="small"
                    onClick={() =>
                      this.voteReview(review.review_id, 'helpful', i)
                    }
                  >
                    yes {review.metrics.helpful_votes}
                  </Button>

                  <Button
                    disabled={review.disabled}
                    variation="danger-tertiary"
                    size="small"
                    onClick={() =>
                      this.voteReview(review.review_id, 'unhelpful', i)
                    }
                  >
                    no {review.metrics.not_helpful_votes}
                  </Button>
                </div>

                <div className="review__comment_more-details mt6">
                  <Collapsible
                    header={<span>More details</span>}
                    onClick={e => {
                      const reviewIndex = i

                      let reviews = this.state.reviews
                      let review = reviews[reviewIndex]
                      review.showDetails = !review.showDetails
                      reviews[reviewIndex] = review

                      this.setState({ reviews: reviews })
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
                          <h5 className="t-heading-5 ma0">Bottom Line</h5>
                          <p>
                            {review.details.bottom_line}, I would{' '}
                            {review.details.bottom_line == 'No' ? 'not ' : ''}
                            recommend to a friend
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
        <div className="review__paging">
          <Pagination
            currentItemFrom={
              1 +
              (this.state.paging.current_page_number - 1) *
                this.state.paging.page_size
            }
            currentItemTo={
              this.state.paging.current_page_number *
              this.state.paging.page_size
            }
            textOf="of"
            totalItems={this.state.paging.total_results}
            onNextClick={this.handleClickNext}
            onPrevClick={this.handleClickPrevious}
          />
        </div>
      </div>
    ) : (
      <div className="review mw8 center ph5">
        <h3 className="review__title t-heading-3 bb b--muted-5 mb5">Reviews</h3>
        <div className="review__comments">
          <div className="review__comments_head">
            <h4 className="review__comments_title t-heading-4 bb b--muted-5 mb5 pb4">
              Reviewed by {this.state.count}{' '}
              {this.state.count == 1 ? 'customer' : 'customers'}
            </h4>
            <div className="mb7">
              <Dropdown
                options={this.state.options}
                onChange={this.handleSort}
                value={this.state.selected}
                {...this.props}
              />
            </div>
            <div className="mb7">
              <Dropdown
                options={this.state.filters}
                onChange={this.handleFilter}
                value={this.state.filter}
                {...this.props}
              />
            </div>

            <div className="mv5">
              {!this.props.data.loading && !this.props.productQuery.loading ? (
                <a
                  href={`/new-review?pr_page_id=${
                    this.props.productQuery.product[
                      this.props.data.getConfig.uniqueId
                    ]
                  }&pr_merchant_id=${
                    this.props.data.getConfig.merchantId
                  }&pr_api_key=${
                    this.props.data.getConfig.appKey
                  }&pr_merchant_group_id=${
                    this.props.data.getConfig.merchantGroupId
                  }`}
                >
                  {' '}
                  Write a review{' '}
                </a>
              ) : null}
            </div>

            <div className="review__comment bw2 bb b--muted-5 mb5 pb4">
              <h5 className="review__comment--user lh-copy mw9 t-heading-5 mv5">
                No reviews found!
              </h5>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const withGetConfig = graphql(getConfig, {
  options: () => ({
    ssr: false,
  }),
})

export default withApollo(withGetConfig(Reviews))
