import React, { useState } from 'react';
import { Select } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { dracula } from '@uiw/codemirror-theme-dracula'; 


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

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleEditorFocus = () => {
    if (!isCodeModified) {
      setCode('');
      setIsCodeModified(true)
    }
  };

  const handleEditorBlur = () => {
    if (code.trim() === '') {
      setCode('// Start coding here!');
      setIsCodeModified(false);
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
    </div>
  );
}

export default Editor;
