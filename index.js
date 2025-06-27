// Initiating the project : adding Express, Body-Parser and axios + setting port/parser/public folder

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const port = 3000;
const app = express();
const actualYear = new Date().getFullYear();
let yearSupported = [];
const lastYearSupported = 1975;

for (let year = actualYear; year >= lastYearSupported; year--) {
  yearSupported.push(year);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// On the load of the page, get Nager API available countries
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

app.listen(port, () => {});
