const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      res.send(investments)
    }
  })
})

const generateHoldingsCSV = (userHoldings, companyNames) => {
  let csv = ""
  for (const user of userHoldings) {
    for (const holding of user.holdings) {
      const value = user.investmentTotal * holding.investmentPercentage
      const company = companyNames[holding.id]
      csv += `${user.userId},${user.firstName},${user.lastName},${user.date},${company},${value}\n`
    }
  }
  return csv
}

app.post("/investments/export", async (_, res) => {
  // Fetch data from other services
  const companiesRes = await fetch(`${config.financialCompaniesUrl}/companies`)
  const companies = await companiesRes.json()

  const userHoldingsRes = await fetch(`${config.investmentsServiceUrl}/investments`)
  const userHoldings = await userHoldingsRes.json()

  // Generate dictionary of company indices and company names
  const companyNames = companies.reduce((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {})

  // Generate CSV data
  const csv = generateHoldingsCSV(userHoldings, companyNames)

  // Send POST request to Investments service
  const options = {
    url: `${config.investmentsServiceUrl}/investments/export`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({csv}),
  }

  request(options, (e) => {
    if (e) {
      console.error(e)
      res.status(500).send("Internal Server Error")
      return
    }

    // Return csv from route as text
    res.setHeader("Content-Type", "text/csv")
    res.send(csv)
  })
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
