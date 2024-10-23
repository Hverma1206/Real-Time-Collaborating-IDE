const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const executeCode = (language, code, res) => {
  let command = '';
  
  // Determine the execution command based on language
  switch (language) {
    case 'javascript':
      command = `node -e "${code.replace(/"/g, '\\"')}"`; // Run JavaScript code
      break;
    case 'python':
      command = `python -c "${code.replace(/"/g, '\\"')}"`; // Run Python code
      break;
    case 'cpp':
      // Save code to a file, compile it, and run
      command = `echo "${code.replace(/"/g, '\\"')}" > temp.cpp && g++ temp.cpp -o temp && ./temp`;
      break;
    case 'java':
      command = `echo "${code.replace(/"/g, '\\"')}" > Temp.java && javac Temp.java && java Temp`;
      break;
    default:
      return res.status(400).json({ error: 'Unsupported language' });
  }

  // Execute the command
  exec(command, (err, stdout, stderr) => {
    if (err || stderr) {
      return res.json({ output: stderr || err.message });
    }
    return res.json({ output: stdout });
  });
};

// Route to handle code execution
app.post('/execute', (req, res) => {
  const { language, code } = req.body;
  executeCode(language, code, res);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
