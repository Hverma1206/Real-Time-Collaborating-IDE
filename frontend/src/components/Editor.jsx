import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript'; // Correct import for JavaScript
import { python } from '@codemirror/lang-python'; // Correct import for Python
import { cpp } from '@codemirror/lang-cpp'; // Correct import for C++
import { java } from '@codemirror/lang-java'// Correct import for Java
import { dracula } from '@uiw/codemirror-theme-dracula'
import { io } from 'socket.io-client'
const { Option } = Select;

const socket = io('http://localhost:5000') // Replace with your server's address

const languageExtensions = {
  javascript,
  python,
  cpp,
  java,
};

function EditorComponent() {
  const [code, setCode] = useState('// Start coding here!')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [roomId, setRoomId] = useState('yourRoomIdHere') // Replace with dynamic roomId
  const [username, setUsername] = useState('User_' + Math.floor(Math.random() * 100))// Temporary username

  // Join the room when the component mounts
  useEffect(() => {
    socket.emit('join', { roomId, username })

    // Listen for code changes
    socket.on('codeChange', (data) => {
      setCode(data.code)

    })

    // Handle initial code request when a user joins
    socket.on('requestCode', () => {

      socket.emit('responseCode', { code });

    });

    socket.on('joined', (data) => {
      console.log(`${data.username} joined the room`);
    });

    socket.on('left', (data) => {
      console.log(`${data.username} left the room`);
    });

    socket.on('disconnected', (data) => {
      console.log(`${data.username} disconnected`);
    });

    return () => {
      socket.emit('leave', { roomId, username });
      socket.off('codeChange');
      socket.off('requestCode');
      socket.off('joined');
      socket.off('left');
      socket.off('disconnected');
    };
  }, [roomId, username, code]);

// real time code edit
  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('codeChange', { roomId, code: value });
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(getStartingSnippet(language));
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
        extensions={[languageExtensions[selectedLanguage]()] }
        onChange={(value) => handleCodeChange(value)}
      />
    </div>
  );
}

export default EditorComponent