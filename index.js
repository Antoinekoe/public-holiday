// Initiating the project : adding Express, Body-Parser and axios + setting port/parser/public folder

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const port = 3000;
const app = express();
const actualYear = new Date().getFullYear();
let yearSupported = [];
const lastYearSupported = 1975;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Setting supported years

for (let year = actualYear; year >= lastYearSupported; year--) {
  yearSupported.push(year);
}

// Creating the function that formats the date from Nager API to normal format

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// On the load of the page, get Nager API available countries and give all the years supported

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://date.nager.at/api/v3/AvailableCountries"
    );
    const result = response.data;
    res.render("index.ejs", { dataGet: response, yearGet: yearSupported });
  } catch (error) {
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

// When the user choose a year and a country, get the Public Holidays and send it to index.ejs - format the date received and send it to index.ejs

app.get("/public-holiday", async (req, res) => {
  try {
    let country = req.query.country;
    let year = req.query.year;
    const response = await axios.get(
      "https://date.nager.at/api/v3/AvailableCountries"
    );
    const responseRequest = await axios.get(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
    );

    const resultRequest = responseRequest.data.map((holiday) => ({
      ...holiday,
      formattedDate: formatDate(holiday.date),
    }));

    res.render("index.ejs", {
      dataGet: response,
      resultRequest: resultRequest,
      yearGet: yearSupported,
    });
  } catch (error) {
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

// App listening on port defined

app.listen(port, () => {});
