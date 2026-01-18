# Notification System

A comprehensive, multi-channel notification service built with modern cloud technologies. Delivers notifications via email, push notifications, and WhatsApp across your application.

## Features

- 📧 **Email Notifications** - Send transactional and marketing emails via Resend
- 🔔 **Push Notifications** - Real-time push notifications using Firebase Cloud Messaging (FCM)
- 💬 **WhatsApp Notifications** - Send messages via WhatsApp (in progress)
- ⚡ **Serverless Architecture** - Built on Supabase Edge Functions for scalability
- 🚀 **Event-Driven** - Trigger notifications through edge functions
- 📋 **Queue System** - Coming soon for reliable message delivery

## Architecture

```
Application Events
       ↓
Supabase Edge Functions
       ↓
Notification Dispatcher
       ↓
  ┌─────┴──────┬──────────┐
  ↓            ↓          ↓
Email (Resend) Push (FCM) WhatsApp (Twilio)
```

### Components

| Service | Purpose | Status |
|---------|---------|--------|
| **Supabase Edge Functions** | Trigger and orchestrate notifications | ✅ Active |
| **Firebase Cloud Messaging** | Push notification delivery | ✅ Active |
| **Resend** | Email delivery | ✅ Active |
| **Twilio** | WhatsApp messaging | 🟡 In Progress |
| **Queue System** | Message reliability & retry logic | 📅 Planned |

## Tech Stack

- **Runtime:** Deno (Supabase Edge Functions)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Email Service:** Resend
- **WhatsApp Service:** Twilio
- **Backend:** Supabase
- **Frontend:** Web (with FCM Web SDK)

## Project Structure

```
notification-system/
├── supabase/
│   ├── functions/
│   │   └── notify/
│   │       ├── index.ts           # Main notification handler
│   │       ├── channels/
│   │       │   ├── email.ts       # Email channel implementation
│   │       │   └── push.ts        # Push notification channel
│   │       └── deno.json          # Dependencies
│   └── config.toml                # Supabase config
├── firebase-messaging-sw.js       # Service Worker for FCM
├── firebase-config.js             # Firebase configuration
├── fcm-test.html                  # FCM testing page
└── README.md                       # This file
```

## Setup

### Prerequisites

- Supabase project
- Firebase project with Cloud Messaging enabled
- Resend API key
- Twilio account (for WhatsApp)
- Node.js or Deno CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notification-system
   ```

2. **Configure Firebase**
   ```bash
   cp firebase-config.example.js firebase-config.js
   # Edit firebase-config.js with your Firebase credentials
   ```

3. **Set up environment variables**
   ```bash
   cp supabase/.env.local.example supabase/.env.local
   ```
   
   Add the following:
   ```
   RESEND_API_KEY=your_resend_api_key
   FCM_SERVER_KEY=your_fcm_server_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_WHATSAPP_NUMBER=your_whatsapp_number
   ```

4. **Deploy Edge Functions**
   ```bash
   supabase functions deploy notify
   ```

## Usage

### Sending Email Notifications

```typescript
const response = await supabase.functions.invoke('notify', {
  body: {
    type: 'email',
    recipient: 'user@example.com',
    subject: 'Welcome!',
    message: 'Thanks for signing up.',
    template: 'welcome' // optional template name
  }
});
```

### Sending Push Notifications

```typescript
const response = await supabase.functions.invoke('notify', {
  body: {
    type: 'push',
    deviceToken: 'fcm_device_token',
    title: 'New Message',
    body: 'You have a new message',
    data: {
      link: '/messages/123'
    }
  }
});
```

### Sending WhatsApp Messages

```typescript
const response = await supabase.functions.invoke('notify', {
  body: {
    type: 'whatsapp',
    phoneNumber: '+1234567890',
    message: 'Hello from our notification system!'
  }
});
```

## Implementation Details

### Email Channel (`channels/email.ts`)
- Integrates with Resend API
- Supports custom templates
- Handles HTML and plain text emails

### Push Channel (`channels/push.ts`)
- Firebase Cloud Messaging integration
- Multi-platform support (web, iOS, Android)
- Custom data payload support
- Device token management

### WhatsApp Channel (In Progress)
- Twilio WhatsApp Business API
- Message templating
- Media support planned

## Testing

### Test Push Notifications
1. Open `fcm-test.html` in your browser
2. Allow notification permission when prompted
3. Copy your device token
4. Use the token to send test notifications via the API

### Local Testing with Supabase CLI

```bash
supabase functions serve
```

## Roadmap

### Phase 1: Foundation (Current) ✅
- [x] Email notifications with Resend
- [x] Push notifications with FCM
- [ ] WhatsApp notifications with Twilio

### Phase 2: Reliability 📅
- [ ] Message queue system
- [ ] Retry logic with exponential backoff
- [ ] Delivery status tracking
- [ ] Dead letter queue

### Phase 3: Advanced Features 📅
- [ ] Notification templates with variable substitution
- [ ] Scheduled notifications
- [ ] User preference management
- [ ] Analytics and delivery metrics
- [ ] Rate limiting per user/type

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Resend email API key | Yes (for email) |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key | Yes (for push) |
| `TWILIO_ACCOUNT_SID` | Twilio account ID | Yes (for WhatsApp) |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | Yes (for WhatsApp) |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp Business number | Yes (for WhatsApp) |

## Error Handling

The system implements graceful error handling:
- Failed notifications are logged
- Queue system (future) will enable retries
- Detailed error responses for debugging

## Performance Considerations

- Edge functions ensure low latency
- Async processing prevents blocking
- Queue system (upcoming) for high-volume scenarios
- Batch operations supported for bulk notifications

## Security

- All API keys stored in environment variables
- No sensitive data logged
- Rate limiting recommended for production
- HTTPS enforced for all communications

## Support

For issues or questions:
1. Check existing documentation
2. Review error logs in Supabase dashboard
3. Test with `fcm-test.html` for push notifications

---

**Status:** Active Development | Last Updated: January 2026
