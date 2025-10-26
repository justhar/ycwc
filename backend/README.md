Prerequisites:

- [Vercel CLI](https://vercel.com/docs/cli) installed globally

To develop locally:

```
npm install
vc dev
```

```
open http://localhost:3000
```

To build locally:

```
npm install
vc build
```

To deploy:

```
npm install
vc deploy
```

## AI Configuration

This project uses Google GenAI (Gemini) for CV parsing and other AI features. To enable AI features locally:

1. Copy `.env.example` to `.env` in the `backend/` folder
2. Set `GOOGLE_API_KEY` to your Google Cloud/Vertex AI API key

Important: Never commit your real API key to the repository.
