---
title: Augur
description: Golang SDK for using LLMs and structured data APIs.
category: personal
year: 2026
role: Solo
tech:
  - Go
  - AI
cover: ./images/augur-cover.png
images:
  - path: ./images/augur.png
    alt: 'Augur: Structured data from LLMs'
links:
  repo: https://github.com/rossbrandon/augur-go
posts:
  - minimovie-a-simple-unoriginal-twist
---

## What Is It?

Augur is a model-agnostic SDK that uses large language models (LLMs) as a structured, schema-aware data retrieval layer. It accepts a natural language query and an output schema, queries an LLM provider, and returns typed, validated, source-attributed data. Use the `augur-go` SDK in your applications to use LLMs with web searches to return data in the schema you provide it. Source links and confidence scores are included in the response attributed to each field requested in your request schema!

### Example Usage

```go
import (
    augur "github.com/rossbrandon/augur-go"
    "github.com/rossbrandon/augur-go/providers/claude"
)

// 1. Define the output shape with struct tags.
type ActorInfo struct {
    NetWorth int64    `json:"netWorth" augur:"required,desc:Estimated net worth"`
    Currency string   `json:"currency" augur:"default:USD,desc:Currency code of net worth"`
    Spouse   string   `json:"spouse"   augur:"required,desc:Current or most recent spouse"`
    Children []string `json:"children" augur:"required,desc:Names of children"`
    AsOfYear int32    `json:"asOfYear" augur:"desc:Estimated year of data"`
}

// 2. Create a client.
client := augur.New(claude.NewProvider(os.Getenv("ANTHROPIC_API_KEY")))

// 3. Query.
resp, err := augur.Query[ActorInfo](ctx, client, &augur.Request{
    Query:   "Tom Hanks net worth and family relationships",
    Context: "Focus on USD financials and immediate family",
})
```

Response Example (in JSON):

```json
{
  "data": {
    "children": [
      "Benjamin Ford",
      "Willard Ford",
      "Malcolm Ford",
      "Georgia Ford",
      "Liam Flockhart Ford"
    ],
    "interestingFact": "Harrison Ford was a self-taught professional carpenter before his acting career took off, and later director Steven Spielberg depicted young Indiana Jones as a Life Scout in the franchise films, mirroring Ford's own achievement as a Life Scout in the Boy Scouts of America.",
    "netWorth": 300000000,
    "parents": "Dorothy Nidelman and John William \"Christopher\" Ford",
    "siblings": "Terence Ford",
    "spouse": "Calista Flockhart"
  },
  "meta": {
    "children": {
      "confidence": 0.99,
      "sources": [
        {
          "url": "https://parade.com/celebrities/harrison-ford-children",
          "title": "Harrison Ford's Family Tree: All About the Actor's 5 Kids"
        },
        {
          "url": "https://en.wikipedia.org/wiki/Harrison_Ford",
          "title": "Harrison Ford - Wikipedia"
        }
      ]
    },
    "interestingFact": {
      "confidence": 0.95,
      "sources": [
        {
          "url": "https://www.alux.com/networth/harrison-ford/",
          "title": "Harrison Ford Net Worth in 2026"
        }
      ]
    },
    "netWorth": {
      "confidence": 0.85,
      "sources": [
        {
          "url": "https://en.tempo.co/read/2090095/harrison-ford-net-worth-2026-how-he-built-his-300-million-fortune",
          "title": "Harrison Ford Net Worth 2026: How He Built His $300 Million Fortune - Life & Style En.tempo.co"
        },
        {
          "url": "https://parade.com/celebrities/harrison-ford-net-worth",
          "title": "From 'Star Wars' to 'Indiana Jones' and Marvel, Harrison Ford's Net Worth in 2026 Is Astronomical"
        }
      ]
    },
    "parents": {
      "confidence": 0.99,
      "sources": [
        {
          "url": "https://en.wikipedia.org/wiki/Harrison_Ford",
          "title": "Harrison Ford - Wikipedia"
        }
      ]
    },
    "siblings": {
      "confidence": 0.99,
      "sources": [
        {
          "url": "https://en.wikipedia.org/wiki/Harrison_Ford",
          "title": "Harrison Ford - Wikipedia"
        }
      ]
    },
    "spouse": {
      "confidence": 0.99,
      "sources": [
        {
          "url": "https://en.wikipedia.org/wiki/Harrison_Ford",
          "title": "Harrison Ford - Wikipedia"
        },
        {
          "url": "https://parade.com/celebrities/harrison-ford-wife-calista-flockhart",
          "title": "Making Leia Jealous! All About Harrison Ford and Wife Calista Flockhart's Relationship"
        }
      ]
    }
  },
  "notes": "Net worth estimates vary across sources, ranging from $230 million to $350 million. The $300 million figure represents the most commonly cited estimate as of 2026. Harrison Ford has five children from three marriages: two biological sons with first wife Mary Marquardt (Benjamin and Willard), two children with second wife Melissa Mathison (Malcolm and Georgia), and one adopted son (Liam) with current wife Calista Flockhart, whom he married in 2010.",
  "provider": "claude",
  "model": "claude-haiku-4-5-20251001",
  "retriesExecuted": 0,
  "latencyMs": 9821,
  "usage": {
    "inputTokens": 28582,
    "outputTokens": 1074,
    "webSearchRequests": 2
  }
}
```
