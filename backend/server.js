const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Endpoint to handle registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Add entry to Notion database
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        Email: {
          email: email,
        },
        Phone: {
          phone_number: phone,
        },
       
        'Registration Date': {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });

    res.status(200).json({ 
      success: true, 
      message: 'Registration successful',
      data: response 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 