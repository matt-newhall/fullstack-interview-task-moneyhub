const R = require("ramda")

const {map, chain} = R

const fetchAndParse = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`)
  }
  return await response.json()
}

const generateCSVLine = companyNames => user => holding => {
  const value = user.investmentTotal * holding.investmentPercentage
  const company = companyNames[holding.id]
  return `${user.userId},${user.firstName},${user.lastName},${user.date},${company},${value}`
}

const generateHoldingsCSV = (userHoldings, companyNames) => {
  const csvLines = chain(user =>
    map(generateCSVLine(companyNames)(user), user.holdings),
  )(userHoldings)

  return R.join("\n", csvLines)
}

const getCompanyNames = (companies) => {
  return companies.reduce((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {})
}

module.exports = {fetchAndParse, generateHoldingsCSV, getCompanyNames}
