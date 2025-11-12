# Storyteller Frontend

React + TypeScript frontend voor de Storytelling Engine, gebouwd voor kinderen (5-10 jaar) met kids-friendly UI patterns.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

App draait op: `http://localhost:3001`

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** + **Radix UI** - Accessible components
- **React Router v6** - Routing
- **Zustand** - State management
- **TanStack Query** - Server state & caching
- **GSAP** - Storytelling animations
- **Framer Motion** - UI animations
- **Lottie** - JSON-based illustrations
- **Howler.js** - Sound effects

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── lib/             # Utilities & helpers
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── package.json
└── vite.config.ts
```

## 📝 Environment Variables

Create `.env.local` in the root of the frontend folder:

```env
VITE_API_URL=http://localhost:3000/api
```

Voor productie (Render.com):
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 🏗️ Build

```bash
npm run build
```

Output wordt gegenereerd in `dist/` folder.

## 🧪 Development

```bash
npm run dev      # Start dev server
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🔗 Links

- Backend Repository: [storyteller-backend](https://github.com/your-org/storyteller-backend)
- Backend API: `http://localhost:3000/api` (development)

## 📚 Features

- 🎨 Kids-friendly UI met grote touch targets
- 📖 Interactieve verhalen met keuzes
- 🎭 Avatar customization
- 📊 Ouder dashboard voor rapporten
- 🧠 Begripstests per segment
- 📈 Voortgang tracking
- 🎵 Sound effects en animaties

## 🚀 Deployment

Deze frontend kan worden gedeployed als static site op:
- Render.com (Static Site)
- Vercel
- Netlify
- GitHub Pages
- Elke andere static hosting service

Zie `DEPLOYMENT.md` in de root repository voor volledige deployment instructies.

## 📄 License

ISC
