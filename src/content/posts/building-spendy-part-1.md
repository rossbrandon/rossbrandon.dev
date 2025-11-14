---
layout: ../layouts/page.astro
title: Building Spendy Part 1
date: 2023-07-15T12:00:00-06:00
author: Ross Brandon
categories:
  - building-stuff
  - development
tags:
  - software
  - dev
---

## What is Spendy?

> Spendy is a super simple budget and expense tracker. Track expenses in your own custom budget categories and get your spending under control!

Or so I said in the site description. In reality, "Spendy" was mainly two things:

One: It was a way for me to force myself into better spending habits. Over the years, I had tried many different budgeting applications such as [Mint](https://mint.intuit.com), [You Need A Budget (YNAB)](https://www.ynab.com/), Personal Capital (now [Empower](https://www.empower.com/empower-personal-wealth-transition)), and, as is tradition, the obligatory plethora of Excel spreadsheets.

Two (and this is the important one): It was a way, much like this very site, for me to try something new and learn a new technology. Like most software engineers, I use side projects as a way to learn languages, new technology stacks, patterns, and trends that I don't typically touch in my day job. This iteration of Spendy _was_ tangentially related to my day job, however. I had just started working as a PHP developer for [Magento](https://en.wikipedia.org/wiki/Magento) and although I didn't work with [Laravel](https://laravel.com/), I did have a desire to dig into it while simultaneously improving my PHP knowledge.

## Why Not Just Use Mint?

Ya know, I like Intuit and I think they generally make good software. I do not, however, like using Mint. At all. I find its interface overwhelming and difficult to perform simple tasks (the ads don't help much). It stikes me as an exceptionally overengineered solution to a (generally speaking) simple problem.

YNAB is a very interesting concept, but it requires that you literally buy into their ideology about budgeting and money management in general. This works very well for many. I did try it for a few months but found myself not using it the way it was meant to be used so it simply did not provide the value to me that it provides the many folks that do it correctly.

## Ok so...

### The "Spendy Philosophy"?

There wasn't one. Simplicity, I guess. I wanted something simple. Something that did not get in my way of creating the visibility of money flow each month. I didn't want it to automatically import and categorize my expenses for me (one thing I did really like about YNAB). I wanted to be able to pull it up, enter in my expenses with the categories and details that I wanted associated with them and have them apply to the custom budget parameters that I defined.

For reporting, all I wanted to see was my progress through the month. How much on any given day I had spent out of my "pot" and how much I had remaining for that month. It focused more on allocation and at-a-glance feedback than detailed analysis and trends of where money was going. It also forced me to enter in what I was spending so I had some forced accountablility there. I couldn't just ignore it while the system pulled in everything behind the scenes: I had to face it. One benefit of having a very simple UX like this was that it didn't require a lot of time to enter in these expenses. I did not have to babysit the app or use it everyday. I could quickly catch up with expense entry even if I skipped a day, week, or even a few months 😓.

### The Product

[Github Repo Link](https://github.com/rossbrandon/spendy)

This is the basic UX I ended up with:

![spendy v1 dashboard](@assets/images/spendy/v1/dashboard.png 'Spendy v1 dashboard')

### Functionality

It consisted of a few basic concepts:

- The top nav showed the top 5 budgets, the currently viewed month, and a user dropdown with the usual login/logout and account management functions.
- Budgets were created with simple name and amount fields as well as a begin and end date in case the budget was temporary.
- Budgets contained expenses and were entered by navigating to a budget and adding it under the currently viewed budget.
- The home page showed a view representing the current month. The selected month could be changed one at a time by using the "Previous Month" and "Next Month" buttons below the top nav bar.
- The main focus was the progress bar which would show how much of the total monthly budget has been spent and which day out of the month it currently was (ex. Day 23 out of 31). This was to give at-a-glance feedback of the current month's status.
- The green "Total Remaining" box would turn red if the "Total Spent" was more than the "Total Budget".
- The table rows showed the breakdown by budget and clicking a row would bring you to that budget's page with the list of its expenses under it.

### Stack

The tech stack for Spendy v1 was fairly simple. It was a `Laravel 5.8` application on `PHP 7.1.3`. To show its age: the current version of Laravel is 10 and PHP 7.1 reached EOL at the end of 2019. A traditional relational DB was used because that it what I was most comfortable with at the time (I came from a MS SQL/Oracle/MySQL background). PostgreSQL was chosen because it was well integrated with Laravel and I wanted to get a little more experience working with it. Laravel's [artisan console](https://laravel.com/docs/10.x/artisanhttps://laravel.com/docs/10.x/artisan) and DB migrations (a-la Ruby on Rails [Active Record](https://guides.rubyonrails.org/active_record_migrations.html)) made creating a traditional CRUD application a very seamless experience.

The application did have a REST API, but its frontend was an integrated MVC application using [Laravel Blade](https://laravel.com/docs/10.x/blade) templates and [Twitter Bootstrap](https://getbootstrap.com/docs/4.0/getting-started/introduction/) `4.0.0`. Basic, but effective.

### Hosting

Since this was a hobby project, I did not want to spend money hosting it. I started out using the free tier on Heroku ([when it existed](https://blog.heroku.com/next-chapter)) which actually worked great with the caveat that your server was not on all the time. So if I went a few hours without using the site, Heroku would spin it down and it would take a bit to start back up when I wanted to use it again. This annoyance led me to look for an alternative. I ended up deploying `spendy.dev` on [AWS Lightsail](https://aws.amazon.com/lightsail/) which offered far more performance than my tiny app needed while costing me about $3/mo. More than $0/mo, but I happily paid it to enjoy having my own work hosted effectively and accessibly.

## Well... What Happened?

Overall, it was successful! I used it for a few years and although it was more for my own simple use cases rather than a strict budgeting tool, I like to think it did help me get a better handle on my finances.

### To Improve in Spendy v2

- Authentication -- Although passwords were salted and hashed, authentication was managed by my code (with the help of Laravel and [Voyager](https://voyager.devdojo.com/)) and thats just not very ideal.
- Tagging -- This version lacked the ability to add tags to an expense. This is a helpful feature for "micro-categorization" or for expenses that don't full neatly into one specific budget. The ability to search and filter these expenses can be very helpful for understanding where money flows.
- Historical trend analysis -- Using tags and budget categories, it's nice to be able to see visualizations on this data. _This was fun to address in Spendy v2_
- Month/Date navigation -- Clicking through the displayed data one month at a time to view something in the past is a tedious user experience.

_To be continued..._
