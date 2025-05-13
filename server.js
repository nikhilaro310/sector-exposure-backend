
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const gbpData = JSON.parse(fs.readFileSync('./sectoral_exposure_gbp.json', 'utf-8'));
const usdData = JSON.parse(fs.readFileSync('./sectoral_exposure_usd.json', 'utf-8'));

const totalExposure = {
  GBP: 5058517305.86,
  USD: 4000000000.00
};

const currentExposures = {
  Hotels: 832638728,
  Healthcare: 700000000
};

const sectorLimits = {
  Hotels: 0.20,
  Healthcare: 0.12
};

app.post('/calculate', (req, res) => {
  const { sector, amount, currency } = req.body;
  if (!sector || !amount || !currency) return res.status(400).json({ error: 'Missing parameters' });

  const currentExposure = currentExposures[sector] || 0;
  const newExposure = parseFloat(amount);
  const totalIfApproved = currentExposure + newExposure;
  const limitPct = sectorLimits[sector] || 0.10;
  const totalCurrExposure = totalExposure[currency] || 1;
  const withinLimit = totalCurrExposure * limitPct;
  const updatedPct = totalIfApproved / totalCurrExposure;
  const remainingCapacity = withinLimit - totalIfApproved;

return res.json({
  currentExposure,
  newExposure,
  totalIfApproved,
  withinLimit,
  updatedPct,
  remainingCapacity,
  limitPct,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
