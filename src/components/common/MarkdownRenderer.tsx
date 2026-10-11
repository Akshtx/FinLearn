import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    // Split content into paragraphs
    const paragraphs = content.split(/\n\s*\n/);

    return paragraphs.map((p, i) => {
      let element = p.trim();
      
      // Headers
      if (element.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-gray-200">{element.substring(4)}</h3>;
      }
      if (element.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 border-b border-gray-700 pb-2 text-sky-400">{element.substring(3)}</h2>;
      }
      
      // Unordered lists
      if (element.startsWith('- ')) {
        const items = element.split('\n').map(item => item.replace(/^- /, '').trim());
        return (
          <ul key={i} className="list-disc list-inside space-y-2 my-4 pl-4">
            {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />)}
          </ul>
        );
      }
      
      // Blockquotes
      if (element.startsWith('> ')) {
          return <blockquote key={i} className="border-l-4 border-sky-500 pl-4 italic text-gray-400 my-4" dangerouslySetInnerHTML={{ __html: formatInline(element.substring(2)) }}></blockquote>
      }

      // Default paragraph
      return <p key={i} className="my-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(element) }} />;
    });
  };
  
  const formatInline = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline">$1</a>'); // Links
  }

  return <div>{renderContent()}</div>;
};

export default MarkdownRenderer;
