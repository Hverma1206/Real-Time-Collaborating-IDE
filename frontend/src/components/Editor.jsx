// Editor.jsx
import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { io } from 'socket.io-client';

const { Option } = Select;

const socket = io('http://localhost:5000'); // Adjust the URL as needed

const languageExtensions = {
  javascript: javascript,
  python: python,
  cpp: cpp,
  java: java,
};

function EditorComponent() {
  const [code, setCode] = useState('// Start coding here!');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  // Emit code change to other users
  const handleCodeChange = (value) => {
    setCode(value);

    // Emit the code change event
    socket.emit('codeChange', { code: value, roomId: 'yourRoomIdHere' }); // Replace with actual room ID
  };

  // Listen for code changes from other users
  useEffect(() => {
    socket.on('codeChange', (data) => {
      if (data.roomId === 'yourRoomIdHere') { // Check if the change is from the same room
        setCode(data.code); // Update the code from other users
      }
    });

    return () => {
      socket.off('codeChange'); // Clean up listener on unmount
    };
  }, []);

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

      <CodeMirror
        value={code}
        height="100%"
        theme={dracula}
        extensions={[languageExtensions[selectedLanguage]()]}
        onChange={handleCodeChange}
      />
    </div>
  );
}

export default EditorComponent;
