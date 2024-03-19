const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")

const {fetchAndParse, generateHoldingsCSV, getCompanyNames} = require("./utils/helpers")

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

app.post("/investments/export", async (_, res) => {
  // Fetch data from other services
  const companies = await fetchAndParse(`${config.financialCompaniesUrl}/companies`)
  const userHoldings = await fetchAndParse(`${config.investmentsServiceUrl}/investments`)

  // Generate dictionary of company indices and company names
  const companyNames = getCompanyNames(companies)

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
