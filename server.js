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

app.post('/calculate', (req, res) => {
  const { sector, amount, currency } = req.body;
  if (!sector || !amount || !currency) return res.status(400).json({ error: 'Missing parameters' });

  const sheetData = currency === 'GBP' ? gbpData : usdData;

  const row = sheetData.find(r => {
    const val = r['Unnamed: 1'];
    return typeof val === 'string' && val.trim().toLowerCase() === sector.trim().toLowerCase();
  });

  if (!row) {
    return res.status(404).json({ error: 'Sector not found in dataset' });
  }

  const currentExposure = parseFloat(row['Unnamed: 2']) || 0;
  const limitPct = parseFloat(row['Unnamed: 3']) || 0.1;

  const newExposure = parseFloat(amount);
  const totalIfApproved = currentExposure + newExposure;
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
    totalExposure: totalCurrExposure
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
