import React, { useState, useRef, useEffect } from 'react';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Masukkan konten...',
  className = '',
  showPreview = true,
  minHeight = '200px',
  onImageSelect
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef(null);

  // Format commands
  const formatCommands = [
    { command: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B' },
    { command: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I' },
    { command: 'underline', icon: 'U', title: 'Underline (Ctrl+U)', shortcut: 'Ctrl+U' },
    { command: 'strikeThrough', icon: 'S', title: 'Strikethrough', shortcut: '' },
  ];

  const alignCommands = [
    {
      command: 'justifyLeft',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      ),
      title: 'Align Left'
    },
    {
      command: 'justifyCenter',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8M6 18h12" />
        </svg>
      ),
      title: 'Align Center'
    },
    {
      command: 'justifyRight',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M12 12h8M6 18h16" />
        </svg>
      ),
      title: 'Align Right'
    },
    {
      command: 'justifyFull',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      title: 'Justify'
    },
  ];

  const listCommands = [
    {
      command: 'insertUnorderedList',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="2" cy="6" r="1" fill="currentColor" />
          <circle cx="2" cy="12" r="1" fill="currentColor" />
          <circle cx="2" cy="18" r="1" fill="currentColor" />
        </svg>
      ),
      title: 'Bullet List'
    },
    {
      command: 'insertOrderedList',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          <text x="2" y="8" fontSize="8" fill="currentColor">1</text>
          <text x="2" y="14" fontSize="8" fill="currentColor">2</text>
          <text x="2" y="20" fontSize="8" fill="currentColor">3</text>
        </svg>
      ),
      title: 'Numbered List'
    },
  ];

  const headingCommands = [
    { command: 'formatBlock', value: 'h1', label: 'H1', title: 'Heading 1' },
    { command: 'formatBlock', value: 'h2', label: 'H2', title: 'Heading 2' },
    { command: 'formatBlock', value: 'h3', label: 'H3', title: 'Heading 3' },
    { command: 'formatBlock', value: 'p', label: 'P', title: 'Paragraph' },
  ];

  // Execute format command
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Handle content change
  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Masukkan URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Insert image from gallery
  const insertImage = () => {
    // This will be handled by parent component
    if (onImageSelect) {
      onImageSelect();
    }
  };

  // Set initial content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={`border-2 border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Heading Dropdown */}
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            defaultValue="p"
          >
            {headingCommands.map((cmd) => (
              <option key={cmd.value} value={cmd.value}>
                {cmd.label}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Format Commands */}
          {formatCommands.map((cmd) => (
            <button
              key={cmd.command}
              type="button"
              onClick={() => executeCommand(cmd.command)}
              className="px-2 py-1 border border-gray-300 rounded text-sm font-bold hover:bg-gray-100"
              title={cmd.title}
            >
              {cmd.icon}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Alignment Commands */}
          {alignCommands.map((cmd) => (
            <button
              key={cmd.command}
              type="button"
              onClick={() => executeCommand(cmd.command)}
              className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
              title={cmd.title}
            >
              {cmd.icon}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* List Commands */}
          {listCommands.map((cmd) => (
            <button
              key={cmd.command}
              type="button"
              onClick={() => executeCommand(cmd.command)}
              className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
              title={cmd.title}
            >
              {cmd.icon}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Link & Image */}
          <button
            type="button"
            onClick={insertLink}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
            title="Insert Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={insertImage}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
            title="Insert Image from Gallery"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Preview Toggle */}
          {showPreview && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className={`px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 flex items-center space-x-1 ${
                  isPreview ? 'bg-blue-100 text-blue-700' : ''
                }`}
                title="Toggle Preview"
              >
                {isPreview ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor/Preview Content */}
      <div className="relative">
        {isPreview ? (
          /* Preview Mode */
          <div 
            className="p-4 prose max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          /* Editor Mode */
          <div
            ref={editorRef}
            contentEditable
            className="p-4 focus:outline-none"
            style={{ minHeight }}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </div>

      {/* Character Count */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500 text-right">
        {value.replace(/<[^>]*>/g, '').length} karakter
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .prose h1 { font-size: 2rem; font-weight: bold; margin: 1rem 0; }
        .prose h2 { font-size: 1.5rem; font-weight: bold; margin: 0.8rem 0; }
        .prose h3 { font-size: 1.25rem; font-weight: bold; margin: 0.6rem 0; }
        .prose p { margin: 0.5rem 0; line-height: 1.6; }
        .prose ul, .prose ol { margin: 0.5rem 0; padding-left: 1.5rem; }
        .prose li { margin: 0.25rem 0; }
        .prose a { color: #3b82f6; text-decoration: underline; }
        .prose img { max-width: 100%; height: auto; margin: 0.5rem 0; }
        .prose strong { font-weight: bold; }
        .prose em { font-style: italic; }
        .prose u { text-decoration: underline; }
        .prose strike { text-decoration: line-through; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
