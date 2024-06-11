const fs = require('fs');
const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

async function generatePDF(templateData) {
    const template = require('./invoice_template');
    console.log(`Data:`, templateData.companyDetails.companyName);
    const htmlTemplate = template(templateData.companyDetails.companyName);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlTemplate);

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    const pdfBase64 = pdfBuffer.toString('base64');

    return pdfBase64;
}

app.get('/generate-pdf', async (req, res) => {
    try {
        const templateData = req.body;
        const pdfBase64 = await generatePDF(templateData);
        res.status(200).send({response: pdfBase64});
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
