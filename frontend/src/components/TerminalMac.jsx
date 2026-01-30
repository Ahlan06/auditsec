import React, { useEffect, useRef, useState } from 'react';

const TerminalMac = ({
  commands = [],
  autoPlay = true,
  title = 'terminal',
  showLeadingPrompt = true,
  leadingPrompt = '$',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef(null);
  const nextCommandTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (nextCommandTimeoutRef.current) clearTimeout(nextCommandTimeoutRef.current);
      typingIntervalRef.current = null;
      nextCommandTimeoutRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || currentCommandIndex >= commands.length) return;

    const command = commands[currentCommandIndex];
    if (typeof command !== 'string') return;

    let charIndex = 0;
    setIsTyping(true);

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (nextCommandTimeoutRef.current) clearTimeout(nextCommandTimeoutRef.current);

    typingIntervalRef.current = setInterval(() => {
      if (charIndex < command.length) {
        setDisplayedText((prev) => prev + command[charIndex]);
        charIndex++;
        return;
      }

      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      setIsTyping(false);

      // Passer à la commande suivante après un délai
      nextCommandTimeoutRef.current = setTimeout(() => {
        if (currentCommandIndex < commands.length - 1) {
          setDisplayedText((prev) => prev + '\n');
          setCurrentCommandIndex((prev) => prev + 1);
        }
      }, 1000);
    }, 50);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (nextCommandTimeoutRef.current) clearTimeout(nextCommandTimeoutRef.current);
      typingIntervalRef.current = null;
      nextCommandTimeoutRef.current = null;
    };
  }, [currentCommandIndex, commands, autoPlay]);

  return (
    <div className="terminal-window">
      {/* Barre de titre macOS */}
      <div className="terminal-header">
        <div className="terminal-button red"></div>
        <div className="terminal-button yellow"></div>
        <div className="terminal-button green"></div>
        <span style={{ 
          fontSize: '13px', 
          color: '#8a8a8a', 
          marginLeft: '12px',
          fontWeight: 500
        }}>
          {title}
        </span>
      </div>

      {/* Corps du terminal */}
      <div className="terminal-body">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {showLeadingPrompt && (
            <span style={{ color: '#4EC9B0', marginRight: '8px', fontWeight: 600 }}>
              {leadingPrompt}
            </span>
          )}
          <div style={{ flex: 1 }}>
            <pre
              style={{
                margin: 0,
                fontFamily: 'SF Mono, Monaco, Courier New, monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {displayedText}
              {isTyping && <span className="terminal-cursor"></span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalMac;
