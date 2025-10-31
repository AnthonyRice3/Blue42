# Checkout Bot Marketplace - Complete Implementation Guide

## Project Overview
A Next.js-based marketplace platform where users can browse, purchase, and download configurable checkout bot executables for major retailers (Target, Sams Club, Pokemon Center, etc.).

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Payments**: Stripe
- **Database**: MongoDB with Mongoose
- **File Storage**: AWS S3 or similar for storing .exe files
- **Bot Packaging**: Electron or similar for creating executable bots

---

## Phase 1: Project Setup & Architecture

### Step 1.1: Initialize Next.js Project
```bash
npx create-next-app@latest checkout-bot-marketplace --typescript --tailwind --app --eslint
cd checkout-bot-marketplace
```

### Step 1.2: Install Core Dependencies
```bash
# Authentication
npm install @clerk/nextjs

# Payment Processing
npm install stripe @stripe/stripe-js

# Database
npm install mongoose mongodb

# Additional utilities
npm install axios react-icons lucide-react
npm install -D @types/node

# UI Components (optional but recommended)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge
```

### Step 1.3: Project Structure
```
checkout-bot-marketplace/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── downloads/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── clerk/route.ts
│   │   │   │   └── stripe/route.ts
│   │   │   ├── bots/
│   │   │   │   └── route.ts
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── downloads/
│   │   │       └── [licenseKey]/route.ts
│   │   ├── bots/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── success/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── BotCard.tsx
│   │   ├── BotGrid.tsx
│   │   ├── Cart.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── mongodb.ts
│   │   │   └── models/
│   │   │       ├── User.ts
│   │   │       ├── Bot.ts
│   │   │       ├── Order.ts
│   │   │       └── License.ts
│   │   ├── stripe.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── bots/
│   └── templates/
│       ├── target-bot/
│       ├── sams-club-bot/
│       └── pokemon-center-bot/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Phase 2: Database Setup

### Step 2.1: MongoDB Connection Setup
Create `src/lib/db/mongodb.ts`:
```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
```

### Step 2.2: Database Models

**User Model** (`src/lib/db/models/User.ts`):
```typescript
import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  stripeCustomerId: String,
  purchases: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  licenses: [{ type: Schema.Types.ObjectId, ref: 'License' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.User || model('User', UserSchema);
```

**Bot Model** (`src/lib/db/models/Bot.ts`):
```typescript
import mongoose, { Schema, model, models } from 'mongoose';

const BotSchema = new Schema({
  name: { type: String, required: true },
  retailer: { type: String, required: true },
  description: { type: String, required: true },
  features: [String],
  price: { type: Number, required: true },
  renewalPrice: { type: Number, default: 0 },
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  supportedSites: [String],
  version: { type: String, default: '1.0.0' },
  executablePath: String, // Path to the base .exe template
  configTemplate: Object, // Default configuration
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.Bot || model('Bot', BotSchema);
```

**Order Model** (`src/lib/db/models/Order.ts`):
```typescript
import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stripeSessionId: { type: String, required: true },
  stripePaymentIntentId: String,
  items: [{
    botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  licenses: [{ type: Schema.Types.ObjectId, ref: 'License' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.Order || model('Order', OrderSchema);
```

**License Model** (`src/lib/db/models/License.ts`):
```typescript
import mongoose, { Schema, model, models } from 'mongoose';
import crypto from 'crypto';

const LicenseSchema = new Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex').toUpperCase()
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  isActive: { type: Boolean, default: true },
  activatedAt: Date,
  expiresAt: Date,
  machineId: String, // To bind license to specific machine
  downloadCount: { type: Number, default: 0 },
  maxDownloads: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.License || model('License', LicenseSchema);
```

---

## Phase 3: Authentication Setup (Clerk)

### Step 3.1: Environment Variables
Add to `.env.local`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB
MONGODB_URI=mongodb+srv://...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=checkout-bots

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3.2: Clerk Middleware
Create `src/middleware.ts`:
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/bots", "/bots/(.*)", "/api/webhooks/(.*)"],
  ignoredRoutes: ["/api/webhooks/clerk", "/api/webhooks/stripe"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Step 3.3: Clerk Webhook Handler
Create `src/app/api/webhooks/clerk/route.ts`:
```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  await connectDB();

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    await User.create({
      clerkId: id,
      email: email_addresses[0].email_address,
      firstName: first_name,
      lastName: last_name,
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    await User.findOneAndUpdate(
      { clerkId: id },
      {
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        updatedAt: new Date(),
      }
    );
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    await User.findOneAndDelete({ clerkId: id });
  }

  return new Response('Webhook processed', { status: 200 });
}
```

---

## Phase 4: Payment Processing (Stripe)

### Step 4.1: Stripe Configuration
Create `src/lib/stripe.ts`:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const getStripeSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};
```

### Step 4.2: Checkout API Route
Create `src/app/api/checkout/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Bot from '@/lib/db/models/Bot';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json(); // Array of { botId, quantity }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch bot details
    const botIds = items.map((item: any) => item.botId);
    const bots = await Bot.find({ _id: { $in: botIds } });

    // Create Stripe line items
    const lineItems = items.map((item: any) => {
      const bot = bots.find(b => b._id.toString() === item.botId);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: bot.name,
            description: bot.description,
            images: bot.imageUrl ? [bot.imageUrl] : [],
          },
          unit_amount: bot.price * 100, // Convert to cents
        },
        quantity: item.quantity || 1,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      metadata: {
        userId: user._id.toString(),
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
```

### Step 4.3: Stripe Webhook Handler
Create `src/app/api/webhooks/stripe/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Order from '@/lib/db/models/Order';
import License from '@/lib/db/models/License';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectDB();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const userId = session.metadata?.userId;
    const items = JSON.parse(session.metadata?.items || '[]');

    // Create order
    const order = await Order.create({
      userId,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      items: items.map((item: any) => ({
        botId: item.botId,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      totalAmount: session.amount_total! / 100,
      status: 'completed',
    });

    // Generate licenses for each bot
    const licenses = [];
    for (const item of items) {
      for (let i = 0; i < (item.quantity || 1); i++) {
        const license = await License.create({
          userId,
          botId: item.botId,
          orderId: order._id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        });
        licenses.push(license._id);
      }
    }

    // Update order with licenses
    order.licenses = licenses;
    await order.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      $push: { purchases: order._id, licenses: { $each: licenses } },
    });

    // TODO: Generate custom .exe files for each license
  }

  return NextResponse.json({ received: true });
}
```

---

## Phase 5: Frontend Components

### Step 5.1: Home Page
Create `src/app/page.tsx`:
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Advanced Checkout Automation
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Secure high-demand items from major retailers with our powerful checkout bots.
            Fast, reliable, and easy to use.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/bots">
              <Button size="lg" variant="secondary">
                Browse Bots
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Checkout in milliseconds with optimized automation
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Licensed software with regular updates and support
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Retailer</h3>
              <p className="text-gray-600">
                Support for Target, Sams Club, Pokemon Center, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Retailers */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Retailers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Target', 'Sams Club', 'Pokemon Center', 'Walmart', 'Best Buy', 'GameStop', 'Amazon', 'Nike'].map((retailer) => (
              <div key={retailer} className="bg-white p-6 rounded-lg shadow text-center">
                <p className="font-semibold">{retailer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

### Step 5.2: Bots Listing Page
Create `src/app/bots/page.tsx`:
```typescript
import connectDB from '@/lib/db/mongodb';
import Bot from '@/lib/db/models/Bot';
import BotGrid from '@/components/BotGrid';

export default async function BotsPage() {
  await connectDB();
  const bots = await Bot.find({ isActive: true }).lean();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Available Bots</h1>
      <BotGrid bots={JSON.parse(JSON.stringify(bots))} />
    </div>
  );
}
```

### Step 5.3: Bot Card Component
Create `src/components/BotCard.tsx`:
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BotCardProps {
  bot: {
    _id: string;
    name: string;
    retailer: string;
    description: string;
    price: number;
    imageUrl?: string;
    features: string[];
  };
  onAddToCart?: (botId: string) => void;
}

export default function BotCard({ bot, onAddToCart }: BotCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(bot._id);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {bot.imageUrl && (
          <Image src={bot.imageUrl} alt={bot.name} fill className="object-cover" />
        )}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
          <span className="font-semibold">${bot.price}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {bot.retailer}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{bot.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{bot.description}</p>
        
        <ul className="mb-4 space-y-1">
          {bot.features.slice(0, 3).map((feature, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <div className="flex gap-2">
          <Link href={`/bots/${bot._id}`} className="flex-1">
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition">
              View Details
            </button>
          </Link>
          <button
            onClick={handleAddToCart}
            className={`flex-1 font-semibold py-2 px-4 rounded transition ${
              isAdded
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAdded ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 5.4: Shopping Cart Component
Create `src/components/Cart.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  botId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(item => ({
          botId: item.botId,
          quantity: item.quantity,
        })),
      }),
    });

    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
      >
        Cart ({items.length})
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500">✕</button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.botId} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold">${total}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Phase 6: Bot Executable Creation

### Step 6.1: Bot Architecture
Each bot executable should contain:
- **Core Bot Logic**: Automation scripts for specific retailers
- **Configuration Module**: Reads user settings
- **License Validation**: Verifies license key with your API
- **Update Checker**: Checks for new versions
- **UI Interface**: Simple GUI for configuration

### Step 6.2: Bot Template Structure (Electron-based)
```
bot-template/
├── src/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload scripts
│   ├── renderer/        # UI components
│   ├── bot/
│   │   ├── core.ts      # Core bot logic
│   │   ├── retailers/
│   │   │   ├── target.ts
│   │   │   ├── sams-club.ts
│   │   │   └── pokemon-center.ts
│   │   └── utils.ts
│   ├── license/
│   │   └── validator.ts # License checking
│   └── config/
│       └── manager.ts   # Config management
├── package.json
├── electron-builder.json
└── .env
```

### Step 6.3: License Validation in Bot
```typescript
// bot-template/src/license/validator.ts
import axios from 'axios';

export async function validateLicense(licenseKey: string, machineId: string) {
  try {
    const response = await axios.post(
      `${process.env.API_URL}/api/license/validate`,
      {
        licenseKey,
        machineId,
      }
    );
    
    return response.data.isValid;
  } catch (error) {
    console.error('License validation failed:', error);
    return false;
  }
}
```

### Step 6.4: License Validation API
Create `src/app/api/license/validate/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';

export async function POST(req: Request) {
  try {
    const { licenseKey, machineId } = await req.json();

    await connectDB();

    const license = await License.findOne({ key: licenseKey });

    if (!license) {
      return NextResponse.json({ isValid: false, error: 'Invalid license' });
    }

    if (!license.isActive) {
      return NextResponse.json({ isValid: false, error: 'License inactive' });
    }

    if (license.expiresAt && new Date() > license.expiresAt) {
      return NextResponse.json({ isValid: false, error: 'License expired' });
    }

    // Bind to machine if not already bound
    if (!license.machineId) {
      license.machineId = machineId;
      await license.save();
    } else if (license.machineId !== machineId) {
      return NextResponse.json({ isValid: false, error: 'License bound to different machine' });
    }

    return NextResponse.json({ isValid: true, bot: license.botId });
  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
```

### Step 6.5: Download API Route
Create `src/app/api/downloads/[licenseKey]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import Bot from '@/lib/db/models/Bot';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  req: Request,
  { params }: { params: { licenseKey: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const license = await License.findOne({ key: params.licenseKey })
      .populate('botId')
      .populate('userId');

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    if (license.userId.clerkId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (license.downloadCount >= license.maxDownloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 403 });
    }

    // Generate presigned URL for S3 download
    const bot = license.botId;
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `bots/${bot._id}/${bot.version}/bot.exe`,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Update download count
    license.downloadCount += 1;
    await license.save();

    return NextResponse.json({
      downloadUrl,
      licenseKey: license.key,
      botName: bot.name,
      expiresAt: license.expiresAt,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
```

---

## Phase 7: Dashboard & Downloads

### Step 7.1: User Dashboard
Create `src/app/(dashboard)/dashboard/page.tsx`:
```typescript
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import License from '@/lib/db/models/License';

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).populate('licenses');
  const licenses = await License.find({ userId: user._id })
    .populate('botId')
    .sort({ createdAt: -1 });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Purchases</p>
          <p className="text-3xl font-bold">{user.purchases.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Active Licenses</p>
          <p className="text-3xl font-bold">
            {licenses.filter((l: any) => l.isActive).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Available Bots</p>
          <p className="text-3xl font-bold">{licenses.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">My Licenses</h2>
        <div className="space-y-4">
          {licenses.map((license: any) => (
            <div
              key={license._id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{license.botId.name}</h3>
                <p className="text-sm text-gray-600">
                  License: {license.key}
                </p>
                <p className="text-sm text-gray-600">
                  Expires: {new Date(license.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/api/downloads/${license.key}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Download
                </a>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                  Copy Key
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 8: Deployment Checklist

### Step 8.1: Environment Setup
1. **MongoDB Atlas**: Create cluster and get connection string
2. **Clerk**: Set up application and get API keys
3. **Stripe**: Create account, set up products, get API keys
4. **AWS S3**: Create bucket for storing bot executables
5. **Vercel/Railway**: Deploy Next.js application

### Step 8.2: Stripe Webhook Configuration
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy webhook secret to `.env.local`

### Step 8.3: Clerk Webhook Configuration
1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret to `.env.local`

### Step 8.4: Database Seeding
Create `scripts/seed-bots.ts`:
```typescript
import connectDB from '../src/lib/db/mongodb';
import Bot from '../src/lib/db/models/Bot';

const bots = [
  {
    name: 'Target Lightning Bot',
    retailer: 'Target',
    description: 'High-speed checkout automation for Target.com',
    features: [
      'Auto-checkout in milliseconds',
      'Multi-account support',
      'Proxy integration',
      'Cart monitoring',
      'Restock alerts'
    ],
    price: 59.99,
    renewalPrice: 9.99,
    supportedSites: ['target.com'],
    imageUrl: '/images/target-bot.png',
  },
  {
    name: 'Pokemon Center Pro',
    retailer: 'Pokemon Center',
    description: 'Specialized bot for Pokemon Center drops',
    features: [
      'Queue bypass technology',
      'Auto-refresh on sold out',
      'Multi-item checkout',
      'Mobile notification support'
    ],
    price: 49.99,
    renewalPrice: 9.99,
    supportedSites: ['pokemoncenter.com'],
    imageUrl: '/images/pokemon-bot.png',
  },
  // Add more bots...
];

async function seed() {
  await connectDB();
  await Bot.deleteMany({});
  await Bot.insertMany(bots);
  console.log('Bots seeded successfully!');
  process.exit(0);
}

seed();
```

---

## Phase 9: Bot Executable Build Process

### Step 9.1: Automated Build Pipeline
1. Create base Electron template with bot logic
2. When order is completed, trigger build process:
   - Inject unique license key into executable
   - Customize configuration for user
   - Build executable using electron-builder
   - Upload to S3 with versioning
   - Update database with file path

### Step 9.2: Build Script Example
```typescript
// scripts/build-bot.ts
import { build } from 'electron-builder';
import fs from 'fs';
import path from 'path';

export async function buildBotForLicense(
  botTemplate: string,
  licenseKey: string,
  userId: string
) {
  const buildDir = path.join(__dirname, 'temp', licenseKey);
  
  // Copy template
  fs.cpSync(botTemplate, buildDir, { recursive: true });
  
  // Inject license key
  const configPath = path.join(buildDir, 'src', 'config', 'license.json');
  fs.writeFileSync(configPath, JSON.stringify({ licenseKey, userId }));
  
  // Build executable
  await build({
    projectDir: buildDir,
    win: ['nsis'],
    config: {
      appId: `com.yourcompany.bot.${licenseKey}`,
      productName: 'Checkout Bot',
      directories: {
        output: path.join(__dirname, 'dist', licenseKey),
      },
    },
  });
  
  // Upload to S3
  const exePath = path.join(__dirname, 'dist', licenseKey, 'Checkout Bot.exe');
  await uploadToS3(exePath, `bots/${userId}/${licenseKey}/bot.exe`);
  
  // Cleanup
  fs.rmSync(buildDir, { recursive: true });
  
  return `bots/${userId}/${licenseKey}/bot.exe`;
}
```

---

## Phase 10: Security Considerations

### 10.1: License Protection
- Bind licenses to hardware ID (MAC address, CPU ID)
- Implement online license validation
- Rate limit validation requests
- Encrypt sensitive data in executable
- Obfuscate code to prevent reverse engineering

### 10.2: Bot Executable Security
```typescript
// In bot executable
import { machineIdSync } from 'node-machine-id';
import crypto from 'crypto';

async function validateOnStartup() {
  const machineId = machineIdSync();
  const licenseKey = getStoredLicenseKey();
  
  const isValid = await validateLicense(licenseKey, machineId);
  
  if (!isValid) {
    showErrorAndExit('Invalid or expired license');
  }
}
```

### 10.3: API Rate Limiting
Use middleware to prevent abuse:
```typescript
// Rate limiting for license validation
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

export default limiter;
```

---

## Additional Features to Consider

1. **Analytics Dashboard**: Track bot performance, success rates
2. **User Profiles**: Save payment methods, shipping addresses
3. **Bot Updates**: Auto-update mechanism for bot executables
4. **Support System**: Ticket system or live chat
5. **Referral Program**: Reward users for referrals
6. **Discord Integration**: Notify users of restocks, updates
7. **Admin Panel**: Manage bots, users, orders, licenses
8. **Documentation**: Setup guides, video tutorials
9. **Monitor Mode**: Preview bot actions before executing
10. **Success Tracking**: Log successful checkouts for analytics

---

## Timeline Estimate

- **Week 1-2**: Setup, authentication, database models
- **Week 3-4**: Payment integration, checkout flow
- **Week 5-6**: Frontend components, bot listing
- **Week 7-8**: Dashboard, license management
- **Week 9-10**: Bot executable templates
- **Week 11-12**: Testing, security hardening
- **Week 13-14**: Deployment, documentation

---

## Legal Considerations

⚠️ **IMPORTANT**: 
- Consult with a lawyer regarding Terms of Service
- Ensure compliance with retailer terms of service
- Include disclaimers about bot usage
- Consider liability insurance
- Implement age verification if needed
- Comply with consumer protection laws
- Handle refunds according to regulations

---

This guide provides a complete roadmap. Start with Phase 1-4 to get the core platform running, then expand with bot functionality and advanced features.
