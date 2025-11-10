import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import FormData from 'form-data';

dotenv.config();

const app = express();
const client = new Anthropic();

// Temporary file storage setup
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Helper function to extract text from uploaded file using Claude vision
async function extractBillData(filePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    
    // Determine media type
    let mediaType = 'application/pdf';
    if (fileName.toLowerCase().endsWith('.png')) mediaType = 'image/png';
    if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) mediaType = 'image/jpeg';

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            },
            {
              type: 'text',
              text: `Extract the following information from this energy bill if available. Return ONLY a JSON object with these fields (use null if not found):
{
  "meterNumber": "the meter/MPAN/MPRN/SPID number",
  "supplier": "current energy supplier name",
  "dayRate": "day rate in p/kWh or similar format",
  "nightRate": "night rate in p/kWh (if applicable)",
  "standingCharge": "standing charge in p/day format",
  "capacity": "available capacity in kVA if shown",
  "businessName": "business name if shown",
  "address": "property address"
}

Return ONLY the JSON object, no other text.`
            }
          ]
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch (e) {
        console.log('Could not parse bill data:', content.text);
        return null;
      }
    }
  } catch (error) {
    console.error('Error extracting bill data:', error);
    return null;
  }
}

// API endpoint to process form submission
app.post('/api/submit-lead', upload.single('billFile'), async (req, res) => {
  try {
    const formData = req.body;
    let extractedBillData = null;

    // If file was uploaded, extract data from it
    if (req.file) {
      extractedBillData = await extractBillData(req.file.path, req.file.originalname);
    }

    // Prepare lead data
    const leadData = {
      timestamp: new Date().toISOString(),
      serviceType: formData.serviceType,
      billProvided: formData.billProvided,
      contractStatus: formData.contractStatus,
      businessName: formData.businessName || extractedBillData?.businessName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      preferredContact: formData.preferredContact,
      additionalInfo: formData.additionalInfo,
      
      // Electricity specific
      meterType: formData.meterType,
      dayRate: formData.dayRate || extractedBillData?.dayRate,
      nightRate: formData.nightRate || extractedBillData?.nightRate,
      capacity: formData.capacity || extractedBillData?.capacity,
      standingCharge: formData.standingCharge || extractedBillData?.standingCharge,
      meterNumber: formData.meterNumber || extractedBillData?.meterNumber,
      propertyAddress: formData.propertyAddress || extractedBillData?.address,
      
      // Gas specific
      gasStandingCharge: formData.gasStandingCharge,
      gasDayRate: formData.gasDayRate,
      gasUsage: formData.gasUsage,
      currentSupplier: formData.currentSupplier || extractedBillData?.supplier,
      
      // Contract dates
      contractEndDate: formData.contractEndDate,
      takeoverDate: formData.takeoverDate,
      energyUsage: formData.energyUsage,
      
      // File info
      billFileName: req.file ? req.file.originalname : null,
      billFileSize: req.file ? req.file.size : null,
      extractedBillData: extractedBillData
    };

    // Send email to tom@smart-energy.uk
    const emailHtml = generateLeadEmail(leadData);
    
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'tom@smart-energy.uk',
      subject: `New Energy Quote Lead: ${leadData.contactName} (${leadData.serviceType})`,
      html: emailHtml,
      attachments: req.file ? [{
        filename: req.file.originalname,
        path: req.file.path
      }] : []
    });

    // Send confirmation email to lead
    const confirmationEmail = `
      <h2>Thank you, ${leadData.contactName}!</h2>
      <p>We've received your energy quote request. We'll review your details and get back to you shortly with a personalized quote.</p>
      <p><strong>What happens next:</strong></p>
      <ul>
        <li>Our team will review your information</li>
        <li>We'll compare rates from 28+ suppliers</li>
        <li>You'll receive a detailed quote via ${leadData.preferredContact || 'email'}</li>
      </ul>
      <p>If you have any questions in the meantime, feel free to get in touch.</p>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: leadData.email,
      subject: 'Your Smart Energy Quote Request - We\'ll be in touch!',
      html: confirmationEmail
    });

    res.json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: `LEAD-${Date.now()}`,
      extractedData: extractedBillData
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to generate professional lead email
function generateLeadEmail(data) {
  return `
    <h2>New Energy Quote Lead Received</h2>
    <p><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
    
    <h3>Contact Information</h3>
    <ul>
      <li><strong>Name:</strong> ${data.contactName}</li>
      <li><strong>Email:</strong> ${data.email}</li>
      <li><strong>Phone:</strong> ${data.phone || 'Not provided'}</li>
      <li><strong>Preferred Contact:</strong> ${data.preferredContact}</li>
    </ul>
    
    <h3>Business Information</h3>
    <ul>
      <li><strong>Business Name:</strong> ${data.businessName || 'Not provided'}</li>
      <li><strong>Service Type:</strong> ${data.serviceType}</li>
      <li><strong>Contract Status:</strong> ${data.contractStatus}</li>
      <li><strong>Bill Provided:</strong> ${data.billProvided}</li>
    </ul>
    
    ${data.serviceType === 'Electricity' ? `
      <h3>Electricity Details</h3>
      <ul>
        <li><strong>Meter Type:</strong> ${data.meterType}</li>
        <li><strong>Day Rate:</strong> ${data.dayRate || 'Not provided'}</li>
        ${data.nightRate ? `<li><strong>Night Rate:</strong> ${data.nightRate}</li>` : ''}
        <li><strong>Standing Charge:</strong> ${data.standingCharge || 'Not provided'}</li>
        ${data.capacity ? `<li><strong>Capacity:</strong> ${data.capacity}</li>` : ''}
        <li><strong>Meter Number:</strong> ${data.meterNumber || 'Not provided'}</li>
        <li><strong>Property Address:</strong> ${data.propertyAddress || 'Not provided'}</li>
      </ul>
    ` : ''}
    
    ${data.serviceType === 'Gas' ? `
      <h3>Gas Details</h3>
      <ul>
        <li><strong>Day Rate:</strong> ${data.gasDayRate || 'Not provided'}</li>
        <li><strong>Standing Charge:</strong> ${data.gasStandingCharge || 'Not provided'}</li>
        <li><strong>Current Supplier:</strong> ${data.currentSupplier || 'Not provided'}</li>
      </ul>
    ` : ''}
    
    <h3>Additional Information</h3>
    <ul>
      <li><strong>Annual Energy Usage:</strong> ${data.energyUsage || 'Not provided'}</li>
      <li><strong>Contract End Date:</strong> ${data.contractEndDate || 'Not provided'}</li>
      ${data.takeoverDate ? `<li><strong>Takeover Date:</strong> ${data.takeoverDate}</li>` : ''}
      <li><strong>Extra Details:</strong> ${data.additionalInfo || 'None'}</li>
    </ul>
    
    ${data.extractedBillData ? `
      <h3>Data Extracted from Bill</h3>
      <p><em>The following information was automatically extracted from the uploaded bill:</em></p>
      <ul>
        ${data.extractedBillData.meterNumber ? `<li>Meter Number: ${data.extractedBillData.meterNumber}</li>` : ''}
        ${data.extractedBillData.supplier ? `<li>Supplier: ${data.extractedBillData.supplier}</li>` : ''}
        ${data.extractedBillData.dayRate ? `<li>Day Rate: ${data.extractedBillData.dayRate}</li>` : ''}
        ${data.extractedBillData.standingCharge ? `<li>Standing Charge: ${data.extractedBillData.standingCharge}</li>` : ''}
      </ul>
    ` : ''}
    
    <hr>
    <p><strong>Bill Attached:</strong> ${data.billFileName || 'None'}</p>
  `;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Lead generation API running on port ${PORT}`);
});
