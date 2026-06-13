'use strict';
var obsidian = require('obsidian');

class MermaidUpdatePlugin extends obsidian.Plugin {
  async onload() {
    console.log('Mermaid Update: loading...');
    await this.loadMermaid();
    console.log('Mermaid Update: mermaid v' + window.mermaid.version + ' ready');

    this.registerMarkdownCodeBlockProcessor('mermaid', async (source, el) => {
      const id = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const container = el.createDiv({ cls: 'mermaid-update-container' });

      const isDark = document.body.classList.contains('theme-dark');
      window.mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
      });

      try {
        const { svg, bindFunctions } = await window.mermaid.render(id, source.trim());
        container.innerHTML = svg;
        if (bindFunctions) bindFunctions(container);
      } catch (err) {
        container.createEl('pre', {
          text: 'Mermaid error:\n' + (err.message || err),
          attr: { style: 'color: var(--text-error); white-space: pre-wrap; font-size: 12px;' }
        });
      }
    });
  }

  loadMermaid() {
    return new Promise((resolve, reject) => {
      if (window.mermaid && window.mermaid.version && window.mermaid.version >= '11.14') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Mermaid from CDN. Check your internet connection.'));
      document.head.appendChild(script);
    });
  }

  onunload() {
    console.log('Mermaid Update: unloaded');
  }
}

module.exports = MermaidUpdatePlugin;
