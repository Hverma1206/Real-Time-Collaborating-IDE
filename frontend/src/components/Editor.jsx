import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { dracula } from '@uiw/codemirror-theme-dracula';
import toast from "react-hot-toast"
const { Option } = Select;

const languageExtensions = {
  javascript: () => javascript(),
  python: () => python(),
  cpp: () => cpp(),
  java: () => java(),
};

function EditorComponent({ socketRef, roomId, userRole }) {
  const [code, setCode] = useState('// Start coding here!');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('codeChange', ({ code }) => {
      setCode(code);
    });

    socketRef.current.on('languageChange', ({ language }) => {
      setSelectedLanguage(language);
      setCode(getStartingSnippet(language));
      const selectElement = document.querySelector('.language-select .ant-select-selection-item');
      if (selectElement) {
        selectElement.textContent = language.charAt(0).toUpperCase() + language.slice(1);
      }
    });

    return () => {
      socketRef.current?.off('codeChange');
      socketRef.current?.off('languageChange');
    };
  }, [socketRef.current]);

  const handleCodeChange = (value) => {
    if (userRole !== 'writer') {
      toast.error('You do not have permission to edit');
      setCode(code); // Reset to previous code
      return;
    }
    
    setCode(value);
    socketRef.current?.emit('codeChange', { roomId, code: value });
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    const newCode = getStartingSnippet(language);
    setCode(newCode);
    socketRef.current?.emit('languageChange', { roomId, language, code: newCode });
  };

  const getStartingSnippet = (language) => {
    switch (language) {
      case 'javascript':
        return `// JavaScript Snippet\nfunction example() {\n  console.log("Hello World");\n}`;
      case 'python':
        return `# Python Snippet\ndef example():\n  print("Hello World")`;
      case 'c++':
        return `// C++ Snippet\n#include <iostream>\nint main() {\n  std::cout << "Hello World" << std::endl;\n  return 0;\n}`;
      case 'java':
        return `// Java Snippet\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}`;
      default:
        return '// Start coding here!';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Select
          value={selectedLanguage} // Change from defaultValue to value
          style={{ width: 200 }}
          onChange={handleLanguageChange}
          disabled={userRole !== 'writer'} // Only writers can change language
          className="language-select"
        >
          <Option value="javascript">JavaScript</Option>
          <Option value="python">Python</Option>
          <Option value="cpp">C++</Option>
          <Option value="java">Java</Option>
        </Select>
        {userRole === 'reader' && (
          <span style={{ color: '#888' }}>Read-only mode</span>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CodeMirror
          value={code}
          height="100%"
          theme={dracula}
          extensions={[languageExtensions[selectedLanguage]()]}

          onChange={handleCodeChange}
          editable={userRole === 'writer'} // Disable editing for readers
          readOnly={userRole !== 'writer'}  // Add explicit readonly
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
          }}
        />
      </div>
    </div>
  );
}

export default EditorComponent;