// Project initialization and configuration
// -------------------------------------
// Importing required packages
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// Setting up constants and configurations
const port = 3000;
const app = express();
const actualDay = new Date();
const dateCourte = actualDay.toLocaleDateString("fr-CA");
const actualYear = new Date().getFullYear();
let yearSupported = [];
const lastYearSupported = 1975;

// Middleware configuration
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Utility Functions
// -------------------------------------
// Generate array of supported years (from current year to 1975)
for (let year = actualYear; year >= lastYearSupported; year--) {
  yearSupported.push(year);
}

// Format date from API format to user-friendly format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Route Handlers
// -------------------------------------
// Home page route - Fetches available countries and renders initial view
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

// Public holidays route - Handles user selection and displays holiday data
app.get("/public-holiday", async (req, res) => {
  try {
    // Get user selections from query parameters
    let country = req.query.country;
    let year = req.query.year;

    // Fetch necessary data from API
    const response = await axios.get(
      "https://date.nager.at/api/v3/AvailableCountries"
    );
    const responseRequest = await axios.get(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
    );

    // Format the holiday dates for display
    const resultRequestFormatted = responseRequest.data.map((holiday) => ({
      ...holiday,
      formattedDate: formatDate(holiday.date),
    }));

    // Render the page with all necessary data
    res.render("index.ejs", {
      dataGet: response,
      actualDay: dateCourte,
      resultRequestFormatted: resultRequestFormatted,
      yearGet: yearSupported,
      year: year,
      countryCode: country,
    });
  } catch (error) {
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

// Server Initialization
// -------------------------------------
app.listen(port, () => {});
