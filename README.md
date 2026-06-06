# whatsapp-lead-widget

Lightweight, framework-agnostic WhatsApp lead capture widget implemented as a Web Component.

Usage (simple):

Include the script and add element:

```html
<script type="module" src="dist/whatsapp-lead-widget.js"></script>

<whatsapp-widget
  phone="+1234567890"
  business-name="My Business"
  title="Chat With Us"
  color="#25D366"
  position="right"
  button-text="Send Message"
>
</whatsapp-widget>
```

Attributes:

- `phone` (required): your WhatsApp number (international format, e.g. +1234567890)
- `business-name`: shown in message header
- `title`: modal title
- `color`: primary accent color
- `position`: `left` or `right` for button placement
- `button-text`: text in the floating button

No backend required. On submit, opens WhatsApp using `https://wa.me/<phone>?text=<message>`.
