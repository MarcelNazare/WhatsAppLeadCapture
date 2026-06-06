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
      <style>
        :host{all:initial}
        .btn-wrap{position:fixed;z-index:9999;bottom:20px;right:20px}
        :host([position="left"]) .btn-wrap{left:20px;right:auto}
        button.fab{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;border:none;box-shadow:0 6px 18px rgba(0,0,0,0.12);cursor:pointer;font-weight:600;color:#fff;background:#25D366}
        button.fab:focus{outline:2px solid rgba(0,0,0,0.12)}
        .icon{width:20px;height:20px;display:inline-block}

        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:none;align-items:center;justify-content:center;z-index:10000}
        .overlay.open{display:flex}
        .modal{width:clamp(280px,90vw,420px);background:#fff;border-radius:12px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,0.2);transform:translateY(12px);opacity:0;transition:all 220ms cubic-bezier(.2,.9,.3,1)}
        .overlay.open .modal{transform:translateY(0);opacity:1}
        .modal header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .modal h2{font-size:16px;margin:0}
        .close{background:transparent;border:none;font-size:20px;cursor:pointer}

        form{display:grid;gap:8px}
        input, textarea{width:100%;padding:10px;border:1px solid #e6e6e6;border-radius:8px;font-size:14px}
        textarea{min-height:80px;resize:vertical}
        .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
        .actions button{padding:8px 12px;border-radius:8px;border:none;cursor:pointer}
        .primary{color:#fff;background:var(--wa-color,#25D366)}
        .secondary{background:#f1f1f1}

        @media (prefers-reduced-motion:reduce){
          .modal{transition:none}
        }
      </style>

      <div class="btn-wrap">
        <button class="fab" part="button" aria-haspopup="dialog" aria-label="Open chat">
          <span class="btn-text">Chat</span>
        </button>
      </div>

      <div class="overlay" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="modal" role="document">
          <header>
            <h2 class="title">Message</h2>
            <button class="close" aria-label="Close">✕</button>
          </header>
          <form novalidate>
            <label>
              <span class="sr">Name (required)</span>
              <input name="name" required placeholder="Your name" aria-label="Your name">
            </label>
            <label>
              <span class="sr">Phone (optional)</span>
              <input name="phone" inputmode="tel" placeholder="Phone number (optional)" aria-label="Phone number">
            </label>
            <label>
              <span class="sr">Message (required)</span>
              <textarea name="message" required placeholder="Your message" aria-label="Message"></textarea>
            </label>
            <div class="actions">
              <button type="button" class="secondary cancel">Cancel</button>
              <button type="submit" class="primary send">Send</button>
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
