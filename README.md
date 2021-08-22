# Pre-reqs
- Install [Node.js](https://nodejs.org/en/)

node version above 10.19

# Getting started
- Clone the repository
```
git clone git@github.com:rishabhjain606/review-scrapper.git <project_name>
```

- Install dependencies
```
cd <project_name>
npm install
```
- Build and run the project
```
npm start
```

- Navigate to `http://localhost:4000` to check if it is working

- For fetching reviews of website  `http://localhost:4000/getReviews?reviewUrl=<URL>&page=<pageNo>`

- Page number (integer) can be passed for pagination. Default value if 1, i.e. first page of review will be displayed. 