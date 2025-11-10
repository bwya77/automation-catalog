import { useEffect } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';

export default function MermaidRenderer() {
  useEffect(() => {
    // Initialize mermaid with configuration
    mermaid.initialize({
      startOnLoad: true,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    // Find all code blocks with mermaid language
    const renderMermaid = async () => {
      const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');

      for (let i = 0; i < mermaidBlocks.length; i++) {
        const block = mermaidBlocks[i];
        const pre = block.parentElement;

        if (!pre || pre.getAttribute('data-mermaid-rendered')) {
          continue;
        }

        try {
          const code = block.textContent || '';
          const { svg } = await mermaid.render(`mermaid-${i}`, code);

          // Replace the pre/code block with the rendered SVG
          const container = document.createElement('div');
          container.className = 'mermaid-diagram';
          container.innerHTML = DOMPurify.sanitize(svg, { FORCE_BODY: true });
          pre.replaceWith(container);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          // Leave the code block as-is if rendering fails
          pre.setAttribute('data-mermaid-error', 'true');
        }
      }
    };

    renderMermaid();

    // Watch for dark mode changes and re-render
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'default';
      mermaid.initialize({ theme: newTheme });
      // Note: Would need to re-render all diagrams here for theme change
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
