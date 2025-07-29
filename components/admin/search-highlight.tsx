interface SearchHighlightProps {
  text: string;
  searchTerm?: string;
}

export function SearchHighlight({ text, searchTerm }: SearchHighlightProps) {
  if (!searchTerm || !text) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => (
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      ))}
    </>
  );
}