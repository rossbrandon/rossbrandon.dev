---
title: Minimovie
description: A minimalist film information site with a clever twist.
category: personal
year: 2026
role: Solo
tech:
  - Astro
  - TypeScript
  - Go
  - PostgreSQL
  - Cloudflare
  - AI
cover: ./images/minimovie.png
images:
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/landing.png
    alt: The MiniMovie landing page in light mode.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/landing-dark.png
    alt: The MiniMovie landing page in dark mode.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/search.png
    alt: The MiniMovie search page.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/search-mobile.png
    alt: The MiniMovie search page on mobile.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/tv-series.png
    alt: The MiniMovie TV Series page.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/person.png
    alt: The MiniMovie Person page.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/person-episodes.png
    alt: Episodes of a TV series that a person appears in.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/age-enrichment.png
    alt: The MiniMovie age engineering functionality showing how old a person was at the time of release.
  - path: ../posts/images/minimovie-a-simple-unoriginal-twist/interesting-info-mobile.png
    alt: The Augur-powered interesting info section on mobile.
links:
  repoFrontend: https://github.com/rossbrandon/minimovie-ui
  repoBackend: https://github.com/rossbrandon/minimovie-api
  site: https://minimovie.info
posts:
  - minimovie-a-simple-unoriginal-twist
---

## What Is It?

MiniMovie came to be out of a deep desire to avoid ads when looking up quick/simple film information. Surprisingly, there are not that many _simple_ movie sites out there once you leave IMDB. Mostly, MiniMovie is a simple, unoriginal twist on the IMDB/TheMovieDB experience but it has the lucky bonus of giving me some tangible application to work on to try out new things in the software engineering space.

Instead of duplicating all of the details here, check out the write up below! This is a playground project I will be continually updating as I find other useful little features or have a technology or pattern that I want a "real world" application to try something on.

## Tech Stack

### Backend

- [Go](https://go.dev)
- [Go Chi](https://go-chi.io)
- [PostgreSQL](https://www.postgresql.org)
- [Railway](https://railway.app)

### Frontend

- [Astro](https://astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [Starwind UI](https://starwind.dev)
- [SolidJS](https://www.solidjs.com) ([Astro Client Islands](https://docs.astro.build/en/concepts/islands/#client-islands))
- [Cloudflare Workers](https://workers.cloudflare.com)
