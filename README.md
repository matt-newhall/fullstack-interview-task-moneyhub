# Moneyhub Tech Test - Investments and Holdings

At Moneyhub we use microservices to partition and separate the concerns of the codebase. In this exercise we have given you an example `admin` service and some accompanying services to work with. In this case the admin service backs a front end admin tool allowing non-technical staff to interact with data.

A request for a new admin feature has been received

## Requirements

- As an admin, I want to be able to generate a CSV report showing the values of all user investment holdings
    - Any new routes should be added to the **admin** service
    - The csv report should be sent to the `/export` route of the **investments** service
    - The investments `/export` route expects the following:
        - content-type as `application/json`
        - JSON object containing the report as csv string, i.e, `{csv: '|User|First Name|...'}`
    - The csv should contain a row for each holding matching the following headers
    |User|First Name|Last Name|Date|Holding|Value|
    - The **Holding** property should be the name of the holding account given by the **financial-companies** service
    - The **Value** property can be calculated by `investmentTotal * investmentPercentage`
    - The new route in the admin service handling the generation of the csv report should return the csv as text with content type `text/csv`
- Ensure use of up to date packages and libraries (the service is known to use deprecated packages but there is no expectation to replace them)
- Make effective use of git

We prefer:
- Functional code
- Ramda.js (this is not a requirement but feel free to investigate)
- Unit testing

### Notes
All of you work should take place inside the `admin` microservice

For the purposes of this task we would assume there are sufficient security middleware, permissions access and PII safe protocols, you do not need to add additional security measures as part of this exercise.

You are free to use any packages that would help with this task

We're interested in how you break down the work and build your solution in a clean, reusable and testable manner rather than seeing a perfect example, try to only spend around *1-2 hours* working on it

## Deliverables
**Please make sure to update the readme with**:

- Your new routes
- How to run any additional scripts or tests you may have added
- Relating to the task please add answers to the following questions;
    1. How might you make this service more secure?
    2. How would you make this solution scale to millions of records?
    3. What else would you have liked to improve given more time?


On completion email a link to your repository to your contact at Moneyhub and ensure it is publicly accessible.

## Getting Started

Please clone this service and push it to your own github (or other) public repository

To develop against all the services each one will need to be started in each service run

```bash
npm start
or
npm run develop
```

The develop command will run nodemon allowing you to make changes without restarting

The services will try to use ports 8081, 8082 and 8083

Use Postman or any API tool of you choice to trigger your endpoints (this is how we will test your new route).

### Existing routes
We have provided a series of routes

Investments - localhost:8081
- `/investments` get all investments
- `/investments/:id` get an investment record by id
- `/investments/export` expects a csv formatted text input as the body

Financial Companies - localhost:8082
- `/companies` get all companies details
- `/companies/:id` get company by id

Admin - localhost:8083
- `/investments/:id` get an investment record by id
- `/investments/export` sends values of all user investment holdings to the Investments service

## Testing

To run the unit tests that were added to test the new `/investments/export` route in the Admin service, run

```bash
cd admin
npm run test
```

## Miscellaneous Questions

### How might you make this service more secure?

(My answer assumes that by 'service' and not 'services', you're referring specifically to the `admin` service!)

1. The `id` input in the `/investments/:id` route is unsanitised, so we would need to validate this data to prevent potential data injection attacks, etc.
2. As this is a service used by non-technical staff, only add permissions to relevant users to make it harder for unwanted persons to access secure investments data.
3. Put user sensitive data (i.e. first name, last name) in a separate table with unique ids, and then refer to these ids in the investments table. This secures the user's data more, preventing unwanted persons from accessing specific user information whilst still being able to view user holdings to some degree. This also fits the investments table into third normal form, as we don't need to state the user's names for each record they appear in.
4. Add logging services to track IPs/users that sent potentially harmful traffic to the service.

### How would you make this solution scale to millions of records?

1. Implement Ramda.js (or other functional tools) to allow for faster processing.
2. Similar to point 3 of question 1, optimise the JSON objects that currently store data to eliminate data redundancy and duplication, easing storage requirements.
3. Implement caching in a better manner than what I have used so far (i.e. storing id-company name pairs in `companyNames`) to reduce response times and calls to other services.

### What else would you have liked to improve given more time?

- Refactor codebase to utilise TypeScript, to minimise type errors that may occur as features are continually added, and to improve DevEx.
- Add additional unit tests to test:
  - Admin service startup
  - Sad path, i.e. a reuqest that results in a 500 response
  - Edge cases (such as no users)
- Improve file structure of repository by extracting route handler functions into a separate folder, for legibility in the `index.js` files.
- Create separate configuration files for development and test mode - currently just have the one. Not an issue currently as config is the same for both.
- Transition to using ES6 import/exports, as opposed to CommonJS.
- Investigate relative performance of functional paradigms used (e.g. was there a faster alternative than `flatMap` and `map` in `utils/holdings/generateHoldingsCSV`).
- Add relevant error handling to the new route, such that the service does not stop if an error occurs.
- Remove error message that appears when Jest tests run, appears to be trying to start the service, and tries to log the 'Server running' message - I've added a `--forceExit` flag for now to ignore this!
