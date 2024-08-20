const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const cors = require('cors');
const Groq = require('groq-sdk');
const dotenv = require('dotenv');
const path = require('path')

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json()); // To parse JSON bodies
app.use(express.static(path.join(__dirname, 'dist')))

app.post('/api/extract-text', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  try {
    // OCR API request to extract text from the image
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('apikey', process.env.OCR_SPACE_KEY);
    formData.append('language', 'eng');
    formData.append('filetype', req.file.mimetype.split('/')[1]);

    const ocrResponse = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: formData.getHeaders(),
    });
    console.log("Never happened");
    
    const parsedResults = ocrResponse.data?.ParsedResults;
    const extractedText = parsedResults && parsedResults[0]?.ParsedText 
      ? parsedResults[0].ParsedText 
      : 'No text found';

    // Add a personalized prompt to the extracted text
    const personalizedPrompt = `This is a question extracted from an image. The spellings may be wrong, so read accordingly. If there are options in the question, please provide an answer by choosing one of the following options based on the text below in bold. Also, add a simple explanation along with the question statement that you understood. Make sure any headings are bold. If there are no options, then answer accordingly. Whatever you answer, write it in bold at the end always:\n\n"${extractedText}"`;


    // Groq API request to get AI response based on the personalized prompt
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: personalizedPrompt,
        },
      ],
      model: 'llama3-8b-8192', // Replace with the appropriate model
    });

    const gptAnswer = chatCompletion.choices[0]?.message?.content || 'No response from AI';
    res.json({ text: extractedText, answer: gptAnswer });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  } finally {
    // Clean up the uploaded file
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
  }
});


app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"))
})

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});