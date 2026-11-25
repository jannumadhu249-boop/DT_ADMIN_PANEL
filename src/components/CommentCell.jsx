import { useState, useLayoutEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   CommentCell — table-cell preview for long comments.
   Shows a "View" button only when the rendered text is actually
   clipped: truncation is detected by measuring the rendered node
   (scrollWidth vs clientWidth) instead of counting characters,
   because CSS ellipsis cuts off much earlier than a fixed
   character limit for variable-width / unbroken strings.

   Props:
   - text           : full comment string
   - onView(text)   : called when the user asks for the full comment
   - maxWidth       : preview width while measuring (default 220px)
   - collapsedWidth : preview width once the View button is shown (default 140px)
───────────────────────────────────────────────────────────── */
export default function CommentCell({ text, onView, maxWidth = 220, collapsedWidth = 140 }) {
  const comment = (text || '').trim();
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      // scrollWidth > clientWidth means the CSS ellipsis is actually hiding text
      const overflowing = el.scrollWidth - el.clientWidth > 1;
      setIsTruncated(overflowing || comment.length > 150);
    };

    measure();
    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(el);
    }
    window.addEventListener('resize', measure);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [comment, maxWidth]);

  if (!comment) {
    return <span style={{ color: '#94a3b8' }}>—</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
      <span
        ref={textRef}
        style={{
          fontSize: '13px',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: `${isTruncated ? collapsedWidth : maxWidth}px`,
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          cursor: isTruncated ? 'pointer' : 'default'
        }}
        title={isTruncated ? 'Click to view full comment' : comment}
        onClick={() => isTruncated && onView(comment)}
      >
        {comment}
      </span>
      {isTruncated && (
        <button
          type="button"
          onClick={() => onView(comment)}
          style={{
            border: '1px solid #bae6fd',
            background: '#f0f9ff',
            color: '#0284c7',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            lineHeight: '1.2'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#0284c7';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#f0f9ff';
            e.currentTarget.style.color = '#0284c7';
          }}
          title="View full comment"
        >
          View
        </button>
      )}
    </div>
  );
}
