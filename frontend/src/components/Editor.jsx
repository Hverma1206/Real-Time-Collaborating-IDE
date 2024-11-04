// Editor.jsx
import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { Editor } from '@monaco-editor/react'; // Use the default export here

const { Option } = Select;

function EditorComponent() {
  const [code, setCode] = useState('// Start coding here!');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(getStartingSnippet(language)); // Reset editor with a snippet
  };

  const getStartingSnippet = (language) => {
    switch (language) {
      case 'javascript':
        return `// JavaScript Snippet\nfunction example() {\n  console.log("Hello World");\n}`;
      case 'python':
        return `# Python Snippet\ndef example():\n  print("Hello World")`;
      case 'cpp':
        return `// C++ Snippet\n#include <iostream>\nint main() {\n  std::cout << "Hello World" << std::endl;\n  return 0;\n}`;
      case 'java':
        return `// Java Snippet\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}`;
      default:
        return '// Start coding here!';
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

      <Editor
        height="100%"
        language={selectedLanguage}
        value={code}
        onChange={handleCodeChange}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default EditorComponent; 
