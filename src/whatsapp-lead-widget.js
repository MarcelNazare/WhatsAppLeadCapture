class WhatsAppWidget extends HTMLElement {
  static get observedAttributes() {
    return ['phone','business-name','title','color','position','button-text'];
  }

  constructor(){
    super();
    this._onKeyDown = this._onKeyDown.bind(this);
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback(){
    this._updateFromAttributes();
  }

  connectedCallback(){
    this._updateFromAttributes();
  }

  _render(){
    const shadow = this.shadowRoot;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
<div class="fixed bottom-5 right-5 z-[9999]">
  <button 
    class="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 shadow-lg shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200" 
    part="button" 
    aria-haspopup="dialog" 
    aria-label="Open chat"
  >
    <span class="text-sm tracking-wide">Chat</span>
  </button>
</div>

<div class="hidden fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-sm items-center justify-center p-4 transition-all duration-300" role="dialog" aria-modal="true" aria-hidden="true">
  
  <div class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 opacity-0 translate-y-4 motion-safe:transition-all motion-safe:duration-300 transform" role="document">
    
    <header class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-bold text-slate-800 tracking-tight">Message</h2>
      <button class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 text-lg leading-none" aria-label="Close">✕</button>
    </header>
    
    <form class="grid gap-4" novalidate>
      <label class="block">
        <span class="sr-only">Name (required)</span>
        <input 
          type="text"
          name="name" 
          required 
          placeholder="Your name" 
          aria-label="Your name"
          class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
        >
      </label>
      
      <label class="block">
        <span class="sr-only">Phone (optional)</span>
        <input 
          type="text"
          name="phone" 
          inputmode="tel" 
          placeholder="Phone number (optional)" 
          aria-label="Phone number"
          class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
        >
      </label>
      
      <label class="block">
        <span class="sr-only">Message (required)</span>
        <textarea 
          name="message" 
          required 
          placeholder="Your message" 
          aria-label="Message"
          class="w-full px-3.5 py-2.5 min-h-[90px] max-h-[200px] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all resize-y"
        ></textarea>
      </label>
      
      <div class="flex gap-2 justify-end mt-2">
        <button 
          type="button" 
          class="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-xl transition-colors cancel"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="px-5 py-2 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.98] rounded-xl shadow-md shadow-green-500/10 transition-all send"
        >
          Send
        </button>
      </div>
    </form>
  </div>
</div>
    `;

    shadow.appendChild(wrapper);

    // refs
    this._btn = shadow.querySelector('button.fab');
    this._btnText = shadow.querySelector('.btn-text');
    this._overlay = shadow.querySelector('.overlay');
    this._modal = shadow.querySelector('.modal');
    this._close = shadow.querySelector('.close');
    this._form = shadow.querySelector('form');
    this._cancel = shadow.querySelector('.cancel');

    this._btn.addEventListener('click', ()=>this.open());
    this._close.addEventListener('click', ()=>this.close());
    this._cancel.addEventListener('click', ()=>this.close());
    this._overlay.addEventListener('click', (e)=>{ if(e.target===this._overlay) this.close(); });
    this._form.addEventListener('submit', (e)=>this._onSubmit(e));
  }

  _updateFromAttributes(){
    const phone = this.getAttribute('phone') || '';
    const business = this.getAttribute('business-name') || '';
    const title = this.getAttribute('title') || 'Chat With Us';
    const color = this.getAttribute('color') || '#25D366';
    const position = this.getAttribute('position') || 'right';
    const btnText = this.getAttribute('button-text') || 'Chat';

    // apply
    this.style.setProperty('--wa-color', color);
    if(position === 'left') this.setAttribute('position','left'); else this.setAttribute('position','right');
    this._btnText.textContent = btnText;
    this._modal.querySelector('.title').textContent = title;
    // store
    this._config = { phone, business, title, color, position };
  }

  open(){
    if(!this._config || !this._config.phone) {
      console.warn('whatsapp-widget: missing `phone` attribute');
    }
    this._overlay.classList.add('open');
    this._overlay.setAttribute('aria-hidden','false');
    this._previousActive = document.activeElement;
    // focus first required
    const first = this._form.querySelector('[name="name"]');
    first.focus();
    document.addEventListener('keydown', this._onKeyDown);
  }

  close(){
    this._overlay.classList.remove('open');
    this._overlay.setAttribute('aria-hidden','true');
    if(this._previousActive && typeof this._previousActive.focus === 'function') this._previousActive.focus();
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown(e){
    if(e.key === 'Escape') this.close();
    if(e.key === 'Tab') this._maintainFocus(e);
  }

  _maintainFocus(e){
    const focusable = this.shadowRoot.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const nodes = Array.from(focusable).filter(n => !n.hasAttribute('disabled'));
    if(nodes.length===0) return;
    const first = nodes[0];
    const last = nodes[nodes.length-1];
    if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
  }

  _onSubmit(e){
    e.preventDefault();
    const fd = new FormData(this._form);
    const name = (fd.get('name')||'').toString().trim();
    const phone = (fd.get('phone')||'').toString().trim();
    const message = (fd.get('message')||'').toString().trim();

    // simple validation
    if(!name){ this._flashInvalid('name'); return; }
    if(!message){ this._flashInvalid('message'); return; }

    // prepare outgoing message
    const business = this._config?.business || '';
    let text = '';
    if(business) text += `Hello ${business}, `;
    text += `My name is ${name}.`;
    if(phone) text += ` Phone: ${phone}.`;
    text += ` Message: ${message}`;

    const phoneTarget = this._config?.phone || '';
    const digits = (phoneTarget || '').replace(/[^0-9]/g,'');
    const encoded = encodeURIComponent(text);
    if(!digits){
      // open generic wa.me with text only (some clients support)
      const url = `https://wa.me/?text=${encoded}`;
      window.open(url, '_blank');
    } else {
      const url = `https://wa.me/${digits}?text=${encoded}`;
      window.open(url, '_blank');
    }

    this.close();
    this._form.reset();
  }

  _flashInvalid(name){
    const el = this._form.querySelector(`[name="${name}"]`);
    if(!el) return;
    el.focus();
    el.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.12)';
    setTimeout(()=> el.style.boxShadow='none', 1200);
  }
}

if(!customElements.get('whatsapp-widget')){
  customElements.define('whatsapp-widget', WhatsAppWidget);
}

export default WhatsAppWidget;
