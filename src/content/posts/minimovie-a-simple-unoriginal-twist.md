---
layout: ../layouts/page.astro
title: 'MiniMovie: A Simple Twist On An Unoriginal Idea'
description: 'How I built MiniMovie, a Go and Astro side project deployed on Railway and Cloudflare.'
date: 2026-04-23T00:00:00-06:00
author: Ross Brandon
categories:
  - building-stuff
  - development
tags:
  - software
  - dev
  - go
  - astro
  - cloudflare
  - railway
---

## Minimal, Yet Interesting

Let’s face it: we all watch a lot of movies and TV shows. When I am not building software, reading about software, or otherwise interacting with something software-engineering-adjacent, I’m usually taking breaks inside some sort of story[^time]. I love a good sci-fi adventure, crime thriller, or comedy to take my mind off of the world. But no matter how engaging the film is, I inevitably end up on my phone looking stuff up:

- “How old was that actor when they filmed this?”
- ”What else have I seen them in?”
- “What's their net worth? Who are their parents? Are they related to that other actor I'm thinking of?”
- ”Where can I stream the sequel?“

The answers are all out there, it’s just that getting to them can be distracting. _But wait… this is a solved problem! IMDB exists!_ Yes. Yes, it does… and I hate it. IMDB, at least in the last few years, has been completely taken over by ads and bloat. Half of the time I'm scrolling past full-page banners and sponsored content just to find a birthday or _that one actor’s name I can never remember_. And for the more random questions (net worth, family tree, fun facts, etc), I'm bouncing between Google, Wikipedia, and whatever (even more ad-covered) celebrity gossip site happens to rank first 😬.

So, I built [MiniMovie](https://minimovie.info). The idea is simple: a clean, minimal place to look up movies, TV shows, and the people in them with the information I actually care about presented front and center. Ages at the time of filming, where to watch, cast and crew breakdowns, interesting and random facts. All in one place sans the noise. And most importantly, a platform I can keep adding to whenever I find myself Googling for something random and then looking up from my phone and saying to my (all too patient) wife, _“Wait. What happened? I need to go back a few minutes.”_

Like pretty much all of my side projects, the real motivation was part _"I want this thing that I probably only care about to exist"_ and part _"I want to learn some new things."_ This time I wanted to learn Astro, improve my Go skills, and find some clever ways to use generative AI to provide something actually useful to me.

## But Why?

Beyond wanting a better movie watching experience, I had a few technical goals:

1. **Go**: I have been actively developing in Go for a while now and wanted a personal project that would let me keep improving skills in API design and concurrency patterns.
2. **Astro**: I recently rebuilt _this very site_ using [Astro](https://astro.build/) and wanted to take it further with a server-rendered application. Having enjoyed the framework for static content, I wanted to evaluate how well it handles SSR with dynamic content and gain some expertise in that area.
3. **Cloudflare/Railway**: I'll be the first to admit that I'm a [Cloudflare](https://cloudflare.com) shill (this should not be news to anyone who has read my other posts 😄). I wanted to deploy an Astro SSR app on [Cloudflare Workers](https://workers.cloudflare.com/) and see how that experience went. I have also been reading great things about [Railway](https://railway.com) and wanted to give them a shot for hosting the Go app and the Postgres DB. So far, so good.

## The Stack

MiniMovie is two separate applications: a Go backend (REST API, Postgres DB, & third-party integrations) and an Astro (Typescript) frontend.

### Backend

[Github: minimovie-api](https://github.com/rossbrandon/minimovie-api)

The backend is a Go service built using the [Chi](https://github.com/go-chi/chi) router. Chi is a lightweight (and awesome) idiomatic HTTP router built on the Go standard HTTP lib. I prefer this over heavier frameworks like Gin due to this fact alone. I've had great results in performance and DevEx in both professional and personal projects with the Chi library.

- Language: [Go](https://go.dev/)
- HTTP: [Chi](https://github.com/go-chi/chi)
- Persistence Layer: [PostgreSQL](https://www.postgresql.org/) via [pgx](https://github.com/jackc/pgx)
- Caching: [BigCache](https://github.com/allegro/bigcache)
- Movie/TV Series/Person Source Data: [TMDB API](https://developer.themoviedb.org/)
- Logging: [zerolog](https://github.com/rs/zerolog)
- Telemetry and Metrics: [OpenTelemetry](https://opentelemetry.io/) feeding to [Grafana](https://grafana.com/)

### Frontend

[Github: minimovie-ui](https://github.com/rossbrandon/minimovie-ui)

The UI is an SSR Astro application. All heavy and critical rendering happens on the server side inside Cloudflare Workers. Areas of the application that need more dynamic behavior are built using [Client Islands](https://docs.astro.build/en/concepts/islands/#client-islands). I am a huge fan of this architecture: send as little JS to the client as possible. Do the heavy lifting where it's most efficient and closer to your resources and data. Need some interactivity? Only make _those components_ interactive. As it should be. Better for performance. Better for SEO. Best of all, I can use aggressive caching in Cloudflare Workers to cache the entire page HTML and avoid the majority of API calls that would otherwise be required.

- [Astro 6](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Starwind UI](https://starwind.dev/)
- [Tabler Icons](https://tabler.io/icons)

## Hosting

The Go API and Postgres database both live on Railway's hobby plan which gives me 8GB RAM, 8 vCPUs, and 5GB of storage. More than enough for what I need with the exception of a small issue with shared disk I/O constraints during heavy Postgres read operations. Honestly, the Railway experience has been fantastic. The UI is simple and easy to deploy your desired architecture and the management/logging capabilities are enough for a hobby project like this one.

![The Railway UI architecture view.](@assets/images/minimovie/railway_architecture.png 'The Railway UI architecture view.')

The frontend is deployed on Cloudflare Workers using the [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter. As always, Cloudflare makes deployments easy and the Astro integration is dead simple. All I really had to do was configure a `wrangler.toml` file, link my repo to my Cloudflare owned domain, and let Cloudflare build and deploy on merge to `main`.

```toml
name = "minimovie-ui"
main = "@astrojs/cloudflare/entrypoints/server"
compatibility_date = "2025-05-21"
compatibility_flags = ["nodejs_compat"]
workers_dev = false

[vars]
LOG_LEVEL = "INFO"
API_BASE_URL = "https://api.minimovie.info"

[limits]
cpu_ms = 1000
subrequests = 10

[[routes]]
pattern = "minimovie.info"
custom_domain = true

[[routes]]
pattern = "www.minimovie.info"
custom_domain = true

[observability]
[observability.logs]
enabled = true
head_sampling_rate = 1
invocation_logs = true
persist = true
```

## Features & Functionality

### Data Source

The majority of the data shown on MiniMovie is directly from or derived from the [TMDB (The Movie Database) API](https://developer.themoviedb.org/docs/getting-started). TMDB (not to be confused with IMDB) provides a **very generous** (50 requests per second) free tier of their API for personal projects. If the TMDB team somehow reads this: _thank you!_ I am very grateful for access to this data so that I was able to build this fun little application and get some genuine use out of it. I've done my best to be responsible with API usage, accreditation, and following terms of service. Let me know if you see something off here!

### Landing

The landing page is intentionally minimal: a centered search box with basic branding and a dark/light theme toggle. I wanted this to set the stage for the application to be no frills and just content presented in an elegant way. _What are you watching?_

<div style="display: flex; gap: 1rem; align-items: start;">

![The MiniMovie landing page.](@assets/images/minimovie/landing.png 'The MiniMovie landing page.')

![The MiniMovie landing page in dark mode.](@assets/images/minimovie/landing_dark.png 'The MiniMovie landing page in dark mode.')

</div>

### Search

Discovery is always the most important part of an application like this. Users want to find what they are looking for as fast as possible. Luckily, TMDB has a `multi_search` endpoint which lets us discover movies, TV shows, and people _at the same time_. When typing a term and hitting enter (or navigating directly to the `https://minimovie.info/search?q=frozen`) the search results page is SSR'd as usual. When entering a search term, results are dynamically retrieved by calling the worker endpoint to trigger SSR and then live swapped into the DOM via a client island.

**Desktop**

![The MiniMovie search results page.](@assets/images/minimovie/search.png 'The MiniMovie search results page.')

**Mobile**

<div style="max-width: 350px; margin: 0 auto;">

![The MiniMovie search results page in a mobile view.](@assets/images/minimovie/search_mobile.png 'The MiniMovie search results page in a mobile view.')

</div>

### Content Pages

Movies, TV Shows (series info, seasons, & episodes), and People (cast & crew) are the main content pages. They show all the typical metadata (title/description, genres, runtime, studio/network, rating, etc.) from TMDB along with the cast and crew grids enriched with the actor's age data (ages at release vs current). Movie pages show collection info if the movie is part of a franchise (like the MCU or Lord of the Rings) and TV shows have a hierarchy of pages for the series itself, each season, and each season’s episodes.

Key crew members such as the creator, writer, director, and producer are shown right below the metadata for easy visibility. Below the heading/metadata content is a tabular interface consisting of five main sections:

- **Top Cast:** the top 16 cast members
- **Season/Collection info:** cards referencing the seasons in a series (or episodes within a season) when viewing a TV show, or cards linking to the other movies within a Movie Collection.
- **Full cast & Crew:** a searchable list of people cards (linking to their respective Person pages) for the entire cast as well as crew such as directors, writers, producers, composers, cinematographers, and editors.
- **Where to Watch:** Where to Watch providers are sourced from [JustWatch](https://justwatch.com) and broken down by streaming, rent, buy, and free categories. A simple _"Stream on Netflix"_ widget is also located right with the top metadata for quick glance info.
- **More Info:** Other random data points such as language info, production companies, etc.

On mobile views these tabs respond to touch gestures so you can swipe left and right between them. The URL also tracks the state of the open tab for deep linking via a `?tab=where-to-watch` search param.

![The series detail page for the TV show Mr. Robot.](@assets/images/minimovie/tv_series.png 'The series detail page for the TV show Mr. Robot.')

![The movie detail page for Star Wars showing the Where to Watch tab.](@assets/images/minimovie/where_to_watch.png 'The movie detail page for Star Wars showing the Where to Watch tab.')

### People

People pages show a combined filmography across movies and series highlighting the top eight things they are known for (using a custom algorithm based on TMDB rating, relevancy scores, and calculated role significance). If the person is part of a series, you can click through to see their episode-level appearance breakdown across all seasons. The _Interesting Info_ section provides data found on the web for the person's estimated net worth, family tree, and an interesting fact about them.

![The person detail page for actress Natalie Portman.](@assets/images/minimovie/person.png 'The person detail page for actress Natalie Portman.')

![The person episodes page showing Rami Malek in Mr. Robot.](@assets/images/minimovie/person_episodes.png 'The person episodes page showing Rami Malek in Mr. Robot.')

#### The Age Enrichment

One of the key features I wanted MiniMovie to have was the ability to show the age an actor was when a film was released vs how old they are today. When you look up a movie or show, the API fetches credits from TMDB and then enriches each cast and crew member with their age at the time of release, comparing it to their current age (or age at their time of death) to display a simple line of text: _"Age 34 (now 83)"_. For me, this is such a common question I ask while watching basically anything and developing this feature was surprisingly complex.

![Mark Hamill, Harrison Ford, and Carrie Fisher person cards demonstrating the age enrichment display.](@assets/images/minimovie/age_enrichment.png 'Mark Hamill, Harrison Ford, and Carrie Fisher person cards demonstrating the age enrichment display.')

The data required to display this information in various views (for example, for every cast member of a movie or for every credit a person has) could potentially involve thousands of API calls to TMDB and expensive lookups. To account for this, I needed to cache key pieces of this information on my end.

#### Postgres

First off, I needed to create a `people` table in Postgres and store basic information such as their ID, name, popularity, date of birth, and date of death. Using a TMDB [ID export](https://developer.themoviedb.org/docs/daily-id-exports), I was able to grab a list of all of the people (their TMDB IDs, names, and popularity scores) and then write a quick Python script to pull the detailed information for each person with a `popularity score >= 0.5` from the TMDB API and then save them into the Postgres `people` table. Using parallel API calls with a token bucket rate limiting approach to stay under a responsible ~40 requests per second, of course.

```sql
create table if not exists people (
	id integer primary key,
	name text,
	date_of_birth date,
	date_of_death date,
	popularity real default 0,
	fetched boolean default false,
	created_at timestamp default now(),
	updated_at timestamp default now()
);
```

Once the DB was populated with the information needed to calculate the age data I wanted to display, I could implement a tiered caching approach to query this data performantly:

1. **BigCache**: Fast, in-memory cache is checked first.
2. **Postgres**: Long-term storage. Query by IDs (using a [covering index](https://www.postgresql.org/docs/current/indexes-index-only-scans.html)) when BigCache misses.
3. **TMDB API**: Source of truth. If the data in Postgres is missing or marked `fetched: false`, we call TMDB and refresh the DB and cache.

If a person's birthday is already in BigCache, the age calculation is trivial and the lookup is sub-millisecond. If it's a cache miss, the service checks Postgres. If it's not in Postgres either (or is marked as stale), the service fetches it from TMDB, updates it in both BigCache and Postgres, and then calculates the age.

This solution works well for popular cast & crew members but some movies and TV shows have thousands of credits. Fetching age data for every single person in a would cause an N+1 problem, tank response times, and probably get me banned from the TMDB API. To handle this, I implemented a simple priority system that limits TMDB fetches per request and prioritizes who gets fetched first (based upon their visibility in the UI):

| Priority | Role        |
| -------- | ----------- |
| 1        | Directors   |
| 2        | Writers     |
| 3        | Top 10 Cast |
| 4        | Cast 11-25  |
| 5        | Other Crew  |

Directors and writers get fetched first, then the top billed cast. Remaining cast and crew fill in over subsequent requests as the cache warms up. This way the most important people in a movie's credits get their ages populated right away while the rest fill in naturally over time: a balance between data completeness/eventual consistency and prioritizing showing what a user likely actually wants to see.

#### Daily Sync

We're not done yet, though! Sadly, people pass away and I needed a way to keep the cached person data from staying stale forever. To address this, the Go service has a separate `sync` job that runs daily. This job calls the TMDB changes API to get a list of person IDs that have been updated, then marks those people as `fetched=false` in Postgres. The next time someone looks up that person, the service will re-fetch their data from TMDB and update the cache. Given that TMDB's data is user provided (like Wikipedia for movies), we'll probably get a lot of redundant updates here but overall the impact is minimal and the solution has (so far) been simple and effective. Remember: _simple is always better than over-engineered_.

#### The "Interesting Info" Section

This is one of my favorite parts of the project and the feature that ties most directly back to why I wanted to build MiniMovie in the first place. When you view a person's page, MiniMovie can show additional context like estimated net worth, family relationships, and an interesting fact about that person. This is exactly the kind of stuff I used to Google every time I was watching something and got curious about an actor. Now it's elegantly displayed right in the application and I can add to it as much as I want.

##### Augur

But how do we get this data? Isn't it tedious? Not with a clever use of generative AI with web search enabled! To support this use case, I wrote a Go library called [augur-go](https://github.com/rossbrandon/augur-go). Augur is a structured data enrichment library. You define a Go struct with the fields you want populated, and augur queries the LLM to fill them in. Each field comes back with a confidence score and source citations, so the UI can show where the data came from and how confident the model is.

Example Usage:

```go
type personInsights struct {
	NetWorth        int64    `json:"netWorth" augur:"required,desc:Estimated net worth in USD"`
	Parents         []string `json:"parents"  augur:"desc:Names of biological or adoptive parents"`
	Siblings        []string `json:"siblings" augur:"desc:Names of known siblings"`
	Children        []string `json:"children" augur:"desc:Names of known children"`
	Spouse          string   `json:"spouse"   augur:"desc:Name of current or most recent spouse or partner"`
	InterestingFact string   `json:"interestingFact" augur:"desc:One interesting fact about the person"`
}

func (r *Resolver) GetPersonInsights(ctx context.Context, personID int, name string) (*PersonInterestingInfo, error) {
	...
	resp, err := augur.Query[personInsights](ctx, r.client, &augur.Request{
		Query: fmt.Sprintf("Net worth, family relationships, and one interesting fact for the actor/actress %s", name),
		Context: "Focus on USD net worth and immediate family (parents, siblings, children, spouse). " +
			"The interesting fact should be something entertaining or surprising about the person. Keep it family friendly.",
		Options: &augur.QueryOptions{
			Sources: &augur.SourceConfig{
				MaxSearches: augur.Int(2),
			},
		},
	})
	meta := buildMeta(resp.Meta)
	cached := cachedResult{
		Data: resp.Data,
		Meta: meta,
		Notes: resp.Notes,
	}
	return r.buildPersonInterestingInfo(&cached), nil
```

The `Query` and `Context` inputs are the basic guidance for the information that I want Augur to find and the `personInsights` struct represents the schema of the data that I want Augur to return to me.

The API is configured with a minimum confidence (default 0.65) and any field that falls below that threshold is simply omitted from the response. The UI handles missing fields gracefully so if the LLM is unsure about someone's net worth, it just doesn't show it rather than showing bad data. Results are stored in Postgres so the LLM only gets called once per person with a refresh threshold that I can define and tweak as needed. Since we are using an LLM here, this data takes longer that we want for a typical SSR response, so this call lives in an Astro `server:defer` block which provides an easy way to trigger background data fetching that hydrate on the client when ready.

_I am still a data nerd_ so designing Augur to produce structured, source-cited data that I can confidently display in a UI is awesome 😄. I wouldn't rely on anything LLM generated if lives are at stake, but this use case is completely fine for "best effort" data retrieved from automated (and cited) web sources.

<div style="max-width: 350px; margin: 0 auto;">

![The Interesting Info tab for actress Natalie Portman in a mobile view.](@assets/images/minimovie/interesting_info_mobile.png 'The Interesting Info tab for actress Natalie Portman in a mobile view.')

</div>

## What's Next?

For me, MiniMovie is a fun platform for playing around with various tech and learning how to build things to solve problems interesting for me. A few things I plan on adding next:

1. Trending movies and shows.
2. "What to Watch Next": Recommendations based on the currently viewed film. I could use TMDB's recommendations API here or maybe I'll design something to perform vector search on film metadata 🤔.
3. Watchlists and completion metrics: "I've seen this" or "I just watched this" with charts and badges to make interaction with the site a bit more fun.
4. Add more "Interesting Info" to films and people! Movie trailer links to YouTube is a likely next candidate.

## Final Thoughts

MiniMovie has turned into one of my favorite side projects. I'm really happy with the development velocity and pleasure working with Astro and Go have continued to provide. The Augur integration is something I want to expand on and the app has been a fantastic way to get more comfortable with Go concurrency patterns and Postgres optimization.

If any of this sounded interesting, feel free to poke around at [minimovie.info](https://minimovie.info). And if you are interested in the structured LLM enrichment side of things, [augur-go](https://github.com/rossbrandon/augur-go) is open source and I'd love feedback on it.

🚀

[^time]: Slight hyperbole; free time is pretty limited between kids and other life-y things.
