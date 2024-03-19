const fetchAndParse = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`)
  }
  return await response.json()
}

const generateHoldingsCSV = (userHoldings, companyNames) => {
  const csv = userHoldings.flatMap(user =>
    user.holdings.map(holding => {
      const value = user.investmentTotal * holding.investmentPercentage
      const company = companyNames[holding.id]
      return `${user.userId},${user.firstName},${user.lastName},${user.date},${company},${value}`
    }),
  )
  return csv.join("\n")
}

const getCompanyNames = (companies) => {
  return companies.reduce((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {})
}

module.exports = {fetchAndParse, generateHoldingsCSV, getCompanyNames}
