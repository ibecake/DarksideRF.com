import { useState } from "react";

function downloadText(fileName: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function TleBlock({ text, fileName, preview = true, label = "Copy TLE" }: { text: string; fileName: string; preview?: boolean; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="tle-block">
      {preview && <pre className="tle">{text}</pre>}
      <div className="row">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? "Copied" : label}
        </button>
        <button type="button" className="ghost" onClick={() => downloadText(fileName, text)}>Download .tle</button>
      </div>
    </div>
  );
}
