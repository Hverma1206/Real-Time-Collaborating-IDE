import React, { useState } from 'react';
import  CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import 'codemirror/theme/material.css';

function Editor() {
  const [code, setCode] = useState('// Start coding here!');

  const handleCodeChange = (value) => {
    setCode(value);
  };

  return (
    <div style={{ height: '100%' }}>
      <CodeMirror
        value={code}
        height="100%"
        theme="dark"
        extensions={[javascript()]}
        onChange={handleCodeChange}
      />
    </div>
  );
}

export default Editor;
