const { contextBridge } = require('electron');
const path = require('path');
const fs = require('fs');

class ContextMenu {
  constructor(translations, links, cssPath) {
    this.translations = translations;
    this.links = links;
    this.cssPath = cssPath;
  }

  async create(pos) {
    const cssContent = await fs.promises.readFile(this.cssPath, 'utf8');
    
    const menuItems = [
      { label: this.translations.home, href: this.links.home, icon: 'home' },
      { label: this.translations.todolist, href: this.links.todolist, icon: 'list' },
      { label: this.translations.clock, href: this.links.clock, icon: 'schedule' },
      { label: this.translations.calc, href: this.links.Calc, icon: 'Function' },
      { label: this.translations.notes, href: this.links.notes, icon: 'note' },
      { label: this.translations.paint, href: this.links.paint, icon: 'brush' },
    ];

    const menuHTML = `
      <div class="custom-context-menu" id="customContextMenu" style="left: ${pos.x}px; top: ${pos.y}px;">
        ${menuItems.map(item => `
          <div class="menu-item" data-href="${item.href}">
            <span class="material-symbols-outlined">${item.icon}</span>
            <span class="menu-label">${item.label}</span>
          </div>
        `).join('')}
      </div>
    `;

    return { menuHTML, cssContent };
  }
}

module.exports = ContextMenu;
