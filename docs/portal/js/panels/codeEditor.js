#!/usr/bin/env node
import { 
  htmlToNode, htmlToNodes, exists, nonempty
} from '../nanolab.js';


/**
 * Multi-file / multi-tab code editor with interactive syntax highlighting
 */
export class CodeEditor {
  /*
   * Args:
   *  id -- the desired ID for the CodeEditor component (or 'code-editor' by default)
   *  parent -- the parent HTML node to add this component to as a child
   */
  constructor({id,parent}={}) {
    this.id = id ?? `code-editor`;
    this.parent = parent;

    this.outerHTML = `
      <div id="${this.id}" class="full-height">
        <div id="${this.id}-tab-group" class="btn-group"></div>
      </div>
    `;

    this.node = htmlToNode(this.outerHTML);
    this.tabs = this.node.getElementsByClassName('btn-group')[0];

    if( this.parent )
      this.parent.appendChild(this.node);
  }

  /*
   * Layout components given a set of code tabs, sources, or files.
   */
  refresh(tabs) {
    const self = this;

    if( !exists(tabs) )
      return;

    if( this.refreshing ) {
      console.warning(`[CodeEditor] detected re-entrant call to refresh(), skipping...`);
      return;
    }
    
    console.log(`[CodeEditor] refreshing tabs with:`, tabs);
    this.refreshing = true;

    for( const tab_key in tabs ) {
      const tab = tabs[tab_key];
      const ids = this.ids(tab_key);

      const activeTab = this.getActiveTab();
      const isActive = exists(activeTab) ? (ids.tab === activeTab.id) : true; //this.tabs.children.length === 0);

      if( !exists(document.getElementById(ids.tab)) )
      {
        const tabNodes = htmlToNodes(
          `<input type="radio" id="${ids.tab}" class="btn-group-item" name="${this.id}-tab-group" ` +
          `${isActive ? ' checked ' : ' '}> <label for="${ids.tab}">${tab.name}</label>`
        );

        for( const node of tabNodes ) {
          this.tabs.appendChild(node);  
          node.addEventListener('click', (evt) => {
            self.setActiveTab(tab_key);
          });  
        }
      }

      let pageNode = document.getElementById(ids.page);

      if( exists(pageNode) )
        pageNode.remove();

      pageNode = htmlToNode(
        `<div class="code-container full-height hidden" id="${ids.page}">` +
        `<pre><i id="${ids.copy}" class="bi bi-copy btn-copy" title="Copy code to clipboard"></i>` +
        `<code class="language-${tab.lang}">${tab.code}</code></pre></div>`
      );

      Prism.highlightAllUnder(pageNode);

      this.node.appendChild(pageNode);

      document.getElementById(ids.copy).addEventListener('click', (evt) => {
          console.log(`[Property Editor] Copying text from code block to clipboard`);
          navigator.clipboard.writeText(tab.code);
      });

      if( isActive )
        this.setActiveTab(tab_key);
    }

    this.refreshing = false;
  }

  /*
   * Remove this from the DOM
   */
  remove() {
    if( !exists(this.node) )
      return;

    this.node.remove();
    this.node = null;
  }

  /*
   * Get the active tab
   */
  getActiveTab() {
    const tabs = this.node.getElementsByClassName('btn-group-item');

    if( !nonempty(tabs) )
      return;

    for( const page of tabs ) {
      if( page.checked )
        return page;
    }

    return tabs[0];
  }

  /*
   * Change the selected tab
   */
  setActiveTab(key) {
    if( !exists(key) )
      return;

    console.log(`[CodeEditor] changing active tab to '${key}'`);

    const ids = this.ids(key);
    const tab = document.getElementById(ids.tab);

    if( tab.checked != true )
      tab.checked = true;  // this still fires events...

    for( const page of this.node.getElementsByClassName('code-container') ) {
      if( page.id === ids.page )
        page.classList.remove('hidden');
      else
        page.classList.add('hidden');
    };
  }

  /*
   * Get a dict of element IDs specific to a tab
   */
  ids(key) {
    const pre = `${this.id}-${key}-`;
    return {
      tab: pre + 'tab',
      page: pre + 'page',
      copy: pre + 'copy'
    };
  }
}

