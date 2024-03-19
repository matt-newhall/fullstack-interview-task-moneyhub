const config = require("config")
const request = require("request")

const {fetchAndParse, generateHoldingsCSV, getCompanyNames} = require("./utils/helpers")
const {handleCSVExport} = require("./index")

// Mocking the fetchAndParse and request functions
jest.mock("./utils/helpers", () => {
  const originalModule = jest.requireActual("./utils/helpers")
  return {
    ...originalModule,
    fetchAndParse: jest.fn(),
  }
})

jest.mock("request", () => jest.fn())

const companiesData = [{
  "id": "1",
  "name": "Company 1",
  "address": "Address 1",
  "postcode": "Postcode 1",
  "frn": "345872",
},
{
  "id": "2",
  "name": "Company 2",
  "address": "Address 2",
  "postcode": "Postcode 2",
  "frn": "789012",
}]

const holdingsData = [{
  "id": "1",
  "userId": "1",
  "firstName": "Bob",
  "lastName": "Smith",
  "investmentTotal": 1000,
  "date": "2020-01-01",
  "holdings": [{
    "id": "2",
    "investmentPercentage": 1,
  }],
}]

const csv = "1,Bob,Smith,2020-01-01,Company 2,1000"

const reqMock = {}
const resMock = {setHeader: jest.fn(), send: jest.fn(), status: jest.fn().mockReturnValue({send: jest.fn()})}

describe("POST /investments/export", () => {
  it("generates CSV data correctly", () => {
    const companyNames = getCompanyNames(companiesData)
    const csvData = generateHoldingsCSV(holdingsData, companyNames)
    expect(csvData).toEqual(csv)
  })

  it("should return CSV data", async () => {

    fetchAndParse.mockImplementationOnce(() => companiesData)
    fetchAndParse.mockImplementationOnce(() => holdingsData)

    request.mockImplementation((options, callback) => callback())

    await handleCSVExport(reqMock, resMock)

    expect(fetchAndParse).toHaveBeenCalledWith(`${config.financialCompaniesUrl}/companies`)
    expect(fetchAndParse).toHaveBeenCalledWith(`${config.investmentsServiceUrl}/investments`)

    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: `${config.investmentsServiceUrl}/investments/export`,
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({csv}),
    }), expect.any(Function))

    expect(resMock.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv")
    expect(resMock.send).toHaveBeenCalledWith(csv)
  })
})
