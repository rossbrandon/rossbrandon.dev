---
author:
  name: "Ross Brandon"
date: 2023-11-02
publishdate: 2023-11-02
linktitle: "Designing Data Systems With Visibility & Management at the Forefront"
type:
  - post
title: "Designing Data Systems With Visibility & Management at the Forefront"
weight: 10
draft: true
categories:
  - building-stuff
  - development
tags:
  - software
  - dev
---

## What Do We Mean By Data Management?

In short: Data Reconciliation.

Specifically: providing and exposing the needed visibility around system-to-system data flows to enable supportive and correct actions to be taken to ensure data integrity for our users and our internal operations.

## Designing with Data Flow Visibility OOTB

I have spent a lot of time in my professional career thus far working to ensure that data in system A is as expected in system B. Turns out, this is so critical that entire teams have been formed just to create and manage tooling to perform this reconciliations. I know because I was on one of them. Most of the tooling I have created around these efforts was done as an afterthought to the main business applications. The problem with this approach is that it tends to create an environment where data tracing, data visibility, and data management tools are created after the fact and from an "outside looking in" perspective instead of baked into the products we design and build.

In this post, I intend to explore that process a little bit and address why "baking in" and designing solutions with this mindset can help avoid future stress and improve the performance and reliablity of data systems from the onset of the project.

#### Can We Just Do This Later?

Let's face it... we won't. And when we have to, we won't want to and the level of effort will have increased substantially (in some cases it might even turn into someone's entire job).

## Ok, Let's Get On With It

### Example for Discussion Purposes

Below is a super basic example of a system diagram that accepts data generated from a user (uploaded or through user actions & events) and distributes it to many internal consumers to enable some sort of end-product functionality for that user.

![data flow example diagram](/image/data_flow_example.png "data flow example diagram")
(Diagram created with [Excalidraw](https://excalidraw.com/))

- On the left side, we have the "data producers". Or, more simply put, our user generated data.
- In the middle, the "external data consumers" accept that data through feeds and uploads or though events such as behavioral data captured through browser interactions, etc.
- On the internal (right) side, these upstreams systems send messages/notifications about this data to downstream "internal data consumers" representing in this example the services that power product functionality search or machine learning systems.

### What Are We Trying To Do Here?

Our basic goal in this example is to determine if all of the data on the left side is correctly represented in it's end state on the right side. Going one step deeper, we also want to see analysis on the flow from the user to the external data consumer (our collection side) as well as flow from the external data consumer to internal data consumer (end state/product applications) to ensure our internal operations are working smoothly as well.

- The former is typically what the user cares about since it tells them that the products they are trying to use will work correctly.
- The latter helps us internally to identify and debug potential issues between our internal message streams.

## How Can We Do This?

Let's explore a few ways we can accomplish these goals at a high level using our simple example above.

### APIs

Creating APIs in each of the systems to provide the aggregations and detail we want visibility into is critical.

#### Client Side

Depending on the product and the design of our systems in question, we may or may not have the ability to retrieve information in real time about the source data we care about. For example, if our user is a phone client that is uploading images to our image analysis and search service (made up example), we might not be able to query that device in real time to see how many images we should expect to receive on our side. We might only be able to know what we have recieved and can only use that metric as a starting point.

If we control the client (ex. an image upload webpage or phone application), we may be able to retrieve count aggregations and metadata (ex. the user uploaded 1253 images out of 1500 total images on the device) and determine if that is the complete data set we expect or if there was a problem in the data transfer from the client side. From there, we can either feed this up to our services as a "manifest" of sorts or make it available to our data management tooling via a beacon or API in the client application. Again, the method of obtaining this information is highly dependent on our design and privacy/user annoyance tolerance.

Ideally we would want to create and API, beacon, or manifest feed that provides the following aggregations:

- Total documents marked as sent
- Total (relevant) documents on the client
- Error states in aggregate or error telemetry
  - Ex. Failed to send data to collector endpoint due to bad data format

#### Service Side

On the services side, this gets significantly easier because we typically have much greater control these systems -- locked down third parties excluded from this basic example as they may require more effort.

From each service that we want to track as part of our system's data journey, we ideally want to create the following APIs:

- Total documents received per-tenant
  - Options to filter on:
    - Date Range
    - Any relevant metadata that a downstream system's ingestion may filter on such as if an image is marked as public/private
- Document detailed metadata by id
- Error states in aggregate (and by document id if possible -- this can be expensive depending on data size)
  - Ex. Failed to send 23581 notifications for Tenant 1 to message broker due to network error

*Bonus*

Create an API to retrieve all document ids for a given tenant. Depending on our data size, this may need some design work to keep costs down as querying for all document ids on a large data set in real time can be quite expensive. The benefit of this, though, is substantial. If data is submitted in bulk by our users (millions of documents), it is handy to be able to identify the problem subset of documents rather than deal in aggregations. Resubmitting the entire dataset becomes more time consuming and more expensive as the data grows.

#### Actions

The above APIs helps us create visibility into how data flows through our applications and systems both from the client and in our SaaS environment. We will explore a bit more of how these can be used to providing meaningful and actionable data, but what else could we do here? We should also go ahead and create APIs for performing some very powerful mutations on these data sets to manage our tenant's data.

1. Execute re-sync/re-send of data for a given tenant to downstream systems. In the event of an error in data flow, we can expose the ability for authorized internal users (or the client's themselves) to initiate a full re-sync of data either from the client or from upstream to downstream systems. This can go a long way in resolving issues with a simple API call that can be exposed via management UI or built into tooling and automations.
2. Delete data for a given tenant. With the rise of privacy defense and regulation like GDPR, baking in methods for deleting tenant data on request from the beginning can transform an otherwise very expensive and time consuming compliance request to something as simple as a click of a button from our client application or internal support tooling.

*Bonus*

An awesome next step is to build in delete patterns in our notifications/message brokers so that downstream systems can react immediately without requiring further manual action.

### UI Tooling

*Note* I am not an UX designer and the example shown here are poorly constructed widgets that I threw together using [The Tremor React Library](https://tremor.so). Don't judge me.

While the tooling we are discussing here should be API first for internal users to build their own tooling off of a centralized data mgmt platform (think event based data deletion tiggers, automation on data reconciliation analysis, etc), I do not want to discount the value of having a good UX around this data. We have the ability to create powerful tooling for both internal teams and our users themselves if we see fit.

#### External User Facing View

If it is valuable to our use cases, we can put into our user’s own hands a scoped down view of their data so they can see in real time that their updates are flowing and things are working.

External UI functionality ideas:

- Aggregation view for top level data flows relevant to the user. Skip middleware systems and show data flow from their end to the final destination relevant to the end user product that needs the data
- Detailed (searchable) list of data if applicable (ex SKUs for an eCommerce synchronization system)
- Highlight errors and actionable items
- Provide ability to take action if needed
    - Re-sync failed/missing documents
    - Request their own data deletion

#### Internal User View

For our internal use cases, we can create a multi-tenant, organized, detailed view to give the power of all of this data directly to our internal support and engineering users.

Internal UI functionality ideas:

- Tenant search - search and select for a tenant to view data for
- Aggregation view for all relevant systems for a given tenant
- Drill down to detailed view for a given tenant and system
- Allow for management of data
    - Deletion
    - Re-sync between system A to X

#### Example Mock Ups

[Tremor Components](https://www.tremor.so/components)

- Overall [progress widget](https://www.tremor.so/docs/components/progress-circle) or [data bars](https://www.tremor.so/docs/components/data-bars): percent progress
- [Donut widget](https://www.tremor.so/docs/components/donut-chart): destination count / source count
- [Bar chart](https://www.tremor.so/docs/components/bar-chart): error state counts
- [Table](https://www.tremor.so/docs/components/table): per document status

## What Do I Gain?

As we continue to build out this functionality through our applications, we start to build a "map" of how our data flows through our various upstream/downstreams systems from end-to-end (client to end product). The more data we feed into this tooling, the more historical analysis we gather that can be used not only to solve immediate problems but identify trends and predict problems with data flows in the future.

The immedate gain is less angry users. Since we have now provided the necessary visibility and action tooling to our support personal (or even the users themselves in certain cases), we can allow for faster recovery to data integrity issues and improve product performance and reliability. Less support tickets equals happier users, happier support personnel, and happier engineering teams who can spend more time building the fun stuff instead of tracking down bugs.

Speaking of engineers, visibility and management of data flows plays a critical role in the development process. Putting these tools into the hands of our engineers allows for real time feedback of data flowing through QA systems and easy triggers for re-sending and moving test data through these systems while building features and troubleshooting bugs.

*Bonus*

Increasing the visibility into our data journey can help us in ensuring we are compliant with regulations such as GDPR and HIPAA. We can get early warning and validate that sensitive and private PII data only exists in systems where it is authorized to be. Through the improved tracability and management actions, we are able to gain confidence that we are protecting our user's data and complying with data privacy requests.

## Isn't This Expensive?

Yes, but doing it from the beginning with this mindset at the forefront will help keep costs and engineering effort within manageable limits. When working with large data sets, the querying of this data in real time becomes much more costly (both in money and time). While I do acknowledge this and do suggest spending design time thinking of how to best query large datasets and weighing the pros and cons from real time reporting vs scheduled aggregations that this tooling can read for less load on crictical systems, I truly believe that the value of this visibility and management tooling speaks for itself. Especially when we have large customers feeding us millions of documents every day and expecting updates reflected in real time in our products and services.

The ideas discussed here require more effort up front to build but aim to save much more time later on. The "fail fast and iterate" approach may want to write this off at first, but I would argue that this tooling *assists* in that iterative approach by giving teams visibility in the behavior of the solutions they are rapidly building and allow for more confidence in iterations and further product MVPs.