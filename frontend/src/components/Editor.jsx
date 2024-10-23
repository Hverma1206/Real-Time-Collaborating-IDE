import React, { useState } from 'react';
import { Select } from 'antd';
import { MonacoEditor } from '@monaco-editor/react';

const { Option } = Select;

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
      setIsCodeModified(true);
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

      <MonacoEditor
        height="100%"
        language={selectedLanguage}
        value={code}
        onChange={handleCodeChange}
        onFocus={handleEditorFocus}
        onBlur={handleEditorBlur}
        options={{
          selectOnLineNumbers: true,
          minimap: {
            enabled: false,
          },
        }}
      />
    </div>
  );
}

export default Editor;
