# EmailJS Configuration Guide

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account (up to 200 emails/month)

## Step 2: Get Your Public Key
1. Go to **Account** → **General** in the EmailJS dashboard
2. Copy your **Public Key**

## Step 3: Create Email Service
1. Go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection steps
5. Copy the **Service ID** (e.g., `service_abc123`)

## Step 4: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use these template variables in your email body:
   ```
   From: {{name}}
   Email: {{email}}
   Subject: {{subject}}
   
   Message:
   {{message}}
   ```
4. Copy the **Template ID** (e.g., `template_xyz789`)

## Step 5: Update Contact Page
Open `frontend/src/pages/ContactPageApple.jsx` and find the `handleSubmit` function around line 65:

```javascript
emailjs.sendForm(
  'YOUR_SERVICE_ID',      // Replace with your Service ID
  'YOUR_TEMPLATE_ID',     // Replace with your Template ID  
  formRef.current,
  'YOUR_PUBLIC_KEY'       // Replace with your Public Key
)
```

Replace the placeholder strings with your actual EmailJS credentials:
- `YOUR_SERVICE_ID` → Your Service ID from Step 3
- `YOUR_TEMPLATE_ID` → Your Template ID from Step 4
- `YOUR_PUBLIC_KEY` → Your Public Key from Step 2

## Example:
```javascript
emailjs.sendForm(
  'service_abc123',
  'template_xyz789',
  formRef.current,
  'SoMe1RandomKey2String3'
)
```

## Testing
1. Start your frontend server: `npm run dev`
2. Navigate to the Contact page
3. Fill out the form and click "Send Message"
4. Check your email inbox for the message
5. Check EmailJS dashboard for sent email logs

## Troubleshooting
- **CORS errors**: Make sure you added your domain (localhost:5173) to the allowed origins in EmailJS settings
- **Invalid credentials**: Double-check your Service ID, Template ID, and Public Key
- **Email not received**: Check your spam folder and EmailJS dashboard logs
