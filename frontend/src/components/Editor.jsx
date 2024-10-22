import React, { useState } from 'react';
import { Select } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';

import 'codemirror/theme/material.css';

const { Option } = Select;

const languageExtensions = {
  javascript: javascript,
  python: python,
 cpp: cpp,
 java : java,
};

function Editor() {
  const [code, setCode] = useState('// Start coding here!');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
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
        <Option value="java">java</Option>

        </Select>
      </div>

      <CodeMirror
        value={code}
        height="100%"
        theme="dark"
        extensions={[languageExtensions[selectedLanguage]()]}
        onChange={handleCodeChange}
      />
    </div>
  );
}

export default Editor;
