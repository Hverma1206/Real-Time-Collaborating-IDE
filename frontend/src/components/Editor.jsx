import React, { useState } from 'react';
import { Select, Button, message } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { dracula } from '@uiw/codemirror-theme-dracula';
import * as Babel from '@babel/standalone';  // Import Babel for JavaScript transpiling

const { Option } = Select;

const languageExtensions = {
  javascript: javascript,
  python: python,
  cpp: cpp,
  java: java,
};

function Editor() {
  const [code, setCode] = useState('// Start coding here!');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isCodeModified, setIsCodeModified] = useState(false);
  const [output, setOutput] = useState('');

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleEditorFocus = () => {
    if (!isCodeModified) {
      setCode('');
      setIsCodeModified(true);
    }
  };

  const handleEditorBlur = () => {
    if (code.trim() === '') {
      setCode('// Start coding here!');
      setIsCodeModified(false);
    }
  };

  const runJavaScriptCode = () => {
    try {
      // Transpile JavaScript code using Babel
      const transpiledCode = Babel.transform(code, { presets: ['env'] }).code;
      const result = new Function(transpiledCode)(); // Execute transpiled code
      setOutput(result !== undefined ? result.toString() : 'No output');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const runCode = () => {
    if (selectedLanguage === 'javascript') {
      runJavaScriptCode();
    } else {
      message.info(`Running ${selectedLanguage} code requires a backend or external API.`);
      setOutput(`Executing ${selectedLanguage} code is not supported locally.`);
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ marginBottom: '10px' }}>
        <Select
          defaultValue={selectedLanguage}
          style={{ width: 200 }}
          onChange={handleLanguageChange}
        >
          <Option value="javascript">JavaScript</Option>
          <Option value="python">Python</Option>
          <Option value="cpp">C++</Option>
          <Option value="java">Java</Option>
        </Select>
        <Button type="primary" onClick={runCode} style={{ marginLeft: '10px' }}>
          Run Code
        </Button>
      </div>

      <CodeMirror
        value={code}
        height="100%"
        theme={dracula}
        extensions={[languageExtensions[selectedLanguage]()]}
        onChange={handleCodeChange}
        onFocus={handleEditorFocus}
        onBlur={handleEditorBlur}
      />

      <div style={{ marginTop: '20px', color: '#fff' }}>
        <h3>Output:</h3>
        <pre style={{ background: '#282C34', padding: '10px', borderRadius: '5px' }}>
          {output}
        </pre>
      </div>
    </div>
  );
}

export default Editor;
