const express = require('express');
const fs = require('fs');
const router = express.Router();
const ExcelJS = require('exceljs');

const DATA_PATH = './data/data.json';

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH);
    return JSON.parse(raw);
  } catch {
    return { balance: 0, expenses: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  const data = readData();
  res.render('index', { balance: data.balance, expenses: data.expenses });
});

router.get('/add-balance', (req, res) => {
  res.render('addBalance');
});

router.post('/add-balance', (req, res) => {
  const data = readData();
  data.balance += parseFloat(req.body.amount);
  data.expenses.push({
    amount: req.body.amount,
    category: 'Balance Addition',
    note: 'N/A',
    createdAt: new Date().toISOString()
  });
  writeData(data);
  res.redirect('/');
});

router.get('/add-expense', (req, res) => {
  res.render('addExpense');
});

router.post('/add-expense', (req, res) => {
  const data = readData();
  data.balance -= parseFloat(req.body.amount);
  data.expenses.push({
    amount: req.body.amount,
    category: req.body.category,
    note: req.body.note,
    createdAt: new Date().toISOString()
  });
  writeData(data);
  res.redirect('/');
});

router.get('/overview', (req, res) => {
  const data = readData();
  const categoryTotals = {};
  data.expenses
    .filter(e => e.category !== 'Balance Addition')
    .forEach(item => {
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + parseFloat(item.amount);
    });
  res.render('overview', { categoryTotals });
});

router.get('/archive', async (req, res) => {
  const data = readData();
  const month = req.query.month;
  const filtered = month
    ? data.expenses.filter(e => e.createdAt.startsWith(month))
    : data.expenses;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Expenses');
  sheet.addRow(['Amount', 'Category', 'Note', 'Timestamp']);
  filtered.forEach(item => {
    sheet.addRow([item.amount, item.category, item.note, item.createdAt]);
  });
  res.attachment('archive.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;