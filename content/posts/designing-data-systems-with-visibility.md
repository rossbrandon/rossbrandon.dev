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
draft: false
categories:
  - building-stuff
  - development
tags:
  - software
  - dev
---

## What Do We Mean By Data Management?

In short: Data Reconciliation.

Specifically: providing and exposing the needed visibility around system-to-system data flows to enable supportive and correct actions to ensure data integrity for our users and our internal operations.

## Designing with Data Flow Visibility OOTB

I have spent a lot of time in my professional career thus far working to ensure that data in system A is as expected in system B. Turns out, this is so critical that entire teams have been formed just to create and manage tooling to perform these reconciliations. I know because I was on one of them. Most of the tooling I have created around these efforts were an afterthought to the main business applications. The problem with this approach is that it tends to create an environment where data tracing, data visibility, and data management tools are created after the fact and from an "outside looking in" perspective instead of baked into the products we design and build.

In this post, I intend to explore that process a little bit and address why "baking in" and designing solutions with this mindset at the forefront can help avoid future stress and improve the performance and reliablity of data systems from the onset of the project.

#### Can We Just Do This Later?

Let's face it... we won't. And when we have to, we won't want to and the level of effort will have increased substantially. In some cases it might even turn into someone's entire job.

## Ok, Let's Get On With It

### Example for Discussion Purposes

Below is a super basic example of a system diagram that accepts data generated from a user (uploaded or through user actions & events) and distributes it to many internal consumers to enable some sort of end-product functionality for that user -- real use cases may vary.

![data flow example diagram](/image/data_mgmt/data_flow_example.png "data flow example diagram")
(Diagram created with [Excalidraw](https://excalidraw.com/))

- On the left side, we have the *data producers*. Or, more simply put, our user generated data.
- In the middle, the *external data consumers* accept that data through feeds and uploads or though events such as behavioral data captured through browser interactions, etc.
- On the internal (right) side, these upstreams systems send messages/notifications about this data to downstream *internal data consumers* representing, in this example, the services that power product functionality such as search or machine learning systems.

### What Are We Trying To Do Here?

Our basic goal in this example is to determine if all of the data on the left side is correctly represented in its end state on the right side. Going one step further, we want to see analysis on the flow from the user to the external data consumer (our collection side) as well as flow from the external data consumer to internal data consumer (end state/product applications) to ensure our internal operations are working smoothly.

- The former is typically what the user cares about since it tells them that the products they are trying to use will work correctly.
- The latter helps us internally to identify and debug potential issues between our internal message streams.

## How Can We Do This?

Let's explore a few ways we can accomplish these goals at a high level using our simple example above.

### APIs

Creating APIs in each of the systems to provide the aggregations and detail we want visibility into is critical.

#### Client Side

Depending on the product we are providing and the design of our systems to support it, we may or may not have the ability to retrieve information in real time about the source data we care about. For example, if our user is a phone client that is uploading images to our image analysis and search service, we might not be able to query that device in real time to see how many images we should expect to receive on our side. We might only be able to know what we have received and can only use that metric as a starting point (ie. what the user has elected to send us).

If we control the client (ex. an image upload webpage or phone application), we may be able to retrieve count aggregations and metadata (ex. the user uploaded 1253 images out of 1500 total images on the device) and determine if that is the complete data set we expect or if there was a problem in the data transfer from the client side. From there, we can either feed this up to our services as a "manifest" of sorts or make it available to our data management tooling via a beacon or API in the client application. Again, the method of obtaining this information is highly dependent on our design and privacy/user annoyance tolerance.

Ideally we would want to create an API, beacon, or manifest feed that provides the following aggregations:

- Total documents marked as sent
- Total (relevant) documents on the client
- Error states in aggregate or error telemetry
  - Ex. Failed to send data to the collector endpoint due to bad data format

#### Service Side

On the services side, this gets significantly easier because we typically have much greater control over these systems -- locked down third parties are excluded from this example as they may require more effort.

In each service that we want to track as part of our system's data journey, we ideally want to create the following APIs:

- Total documents received per-tenant
  - Options to filter on:
    - Date Range
    - Any relevant metadata that a downstream system's ingestion may filter on such as if an image is marked as public/private
- Document detailed metadata by id
- Error states in aggregate (and by document id if possible -- this can be expensive depending on data size)
  - Ex. Failed to send 23581 notifications for Tenant 1 to message broker due to network error

*Bonus*

Create an API to retrieve all document ids for a given tenant. Depending on our data size, this may need some design work to keep costs down as querying for all document IDs on a large data set in real time can be quite expensive. The benefit of this, though, is substantial. If data is submitted in bulk by our users (millions of documents), it is handy to be able to identify the problem subset of documents rather than deal in total aggregations. Resubmitting the entire dataset becomes more time consuming and more expensive as the data grows.

#### Actions

The above APIs helps us create visibility into how data flows through our applications and systems both from the client and in our SaaS environment. We will explore a bit more of how these can be used to providing meaningful and actionable data, but what else could we do here? We could also go ahead and create APIs for performing some very powerful mutations on these data sets to manage our tenant's data:

1. Executing re-sync/re-submission of data for a given tenant to downstream systems. In the event of an error in data flow, we can expose the ability for authorized internal users (or the client's themselves) to initiate a full re-sync of data either from the client or from upstream to downstream systems. This can go a long way in resolving issues with a simple API call that can be exposed via management UI or built into other tooling and automations.
2. Deleting data for a given tenant. With the rise of privacy defense and regulation like GDPR, baking in methods for deleting tenant data on request from the beginning can reduce an otherwise very expensive and time consuming compliance request to something as simple as a click of a button from our client application or internal support tooling.

*Bonus*

An awesome next step is to build in delete patterns for our notifications/message brokers so that downstream systems can react immediately without requiring further manual action.

### UI Tooling

*Note:* I am not an UX designer and the examples shown here are poorly constructed widgets that I threw together using [The Tremor React Library](https://tremor.so). Don't judge me... I'm a data guy.

While the solutions we are discussing here should be API first to enable internal consumers to build their own tooling off of a centralized data management platform (think event based data deletion tiggers, automation on data reconciliation analysis, etc), I do not want to discount the value of having good UX around this data. We have the ability to create powerful interfaces for both internal teams and our users themselves if we see fit.

#### External User Facing View

If it is valuable to our use cases, we can put into our user’s own hands a scoped down view of their data so they can see in real time that their updates are flowing and that things are working.

External UI functionality ideas:

- Aggregation view for top level data flows relevant to the user. Skip middleware systems and show data flow from their end to the final destination relevant to the end user product that needs the data.
- Detailed (searchable) list of data if applicable (ex SKUs for an eCommerce synchronization system)
- Highlight errors and actionable items
- Provide ability to take action if needed
    - Re-sync failed/missing documents
    - Request their own data deletion

#### Internal User View

For our internal use cases we can create a multi-tenant, navigatable, and detailed view to give the power of all of this data directly to our internal support and engineering users.

Internal UI functionality ideas:

- Tenant search - search and select a tenant to view data for
- Aggregation view for all relevant systems for a given tenant
- Drill down to detailed view for a given tenant and system
- Allow for management of data
    - Deletion
    - Re-sync between system A to X

#### Barebones UI Example

To exemplify this, below is a basic example UI of a data flow overview page. It represents a view of a selected tenant's data flow from the perspective of an internal support user. In this case, it follows our example system diagram describing an upstream system *A* and three downstream systems *X*, *Y*, and *Z*. This page shows three main widgets, one for each respective downstream system. Each widget shows the current status of the data flow (*In Error*, *In Progress*, or *Successful*) depending on the source vs destination document counts and various error metadata we are able to retrieve from our APIs. We also show the ID and timestamp of the last document that the downsteam system received. The donut chart shows the total count of documents as well as the count of documents for each state: *Not Sent*, *In Error*, and *Successful*. Finally, there is a *Details* link at the bottom of each card that leads to a detailed view of the data in that flow, if desired. This could be a table with a list of documents in error, more metadata about recent updates, etc.

This UI is obviously oversimplified and lacks basic navigational elements and functionality we would want for real users, but it serves to show that very basic data elements can go a long way in providing insightful information into what is going on in our data journey between systems.

![data flow example ui](/image/data_mgmt/data_flow_ui.png "data flow example ui")
(UI prototype created with [Tremor](https://tremor.so/))

I fully conscede that donut charts are not everyone's favorite. They can easily be replaced with something like [data bars](https://www.tremor.so/docs/components/data-bars) to represent percent progress instead.

![data bars example](/image/data_mgmt/data_flow_bar_chart.png "data bars example")

Charting can also be added to track trends in error states.

![error state trends example](/image/data_mgmt/data_flow_error_chart.png "error state trends example")

Drilling into a specific data flow (ex. Upstream A to Downstream X) can populate a table with per-document state information.

![data flow detail table example](/image/data_mgmt/data_flow_table.png "data flow detail table example")

*Reiterating Note:* Given my terrible UX skills, I am unable to effectively put together all of these pieces into a sleek UI without banging my head against my desk for hours on end, but the basic widgets demonstrate key pieces of functionality that can be combined into a cohesive experience tailored for our different user personas.

## What Do We Gain?

As we continue to build out this functionality through our applications, we start to reveal a "map" of how our data flows through our various upstream and downstream systems from end-to-end (client to end product). The more data we feed into this tooling, the more historical analysis we gather that can be used not only to solve immediate problems but identify trends and predict future problems with data flows.

The immedate gain is less angry users. Since we have now provided the necessary visibility and action tooling to our support personal (or even the users themselves in certain cases), we can allow for faster recovery to data integrity issues and improve product performance and reliability. Less support tickets equals happier users, happier support personnel, and happier engineering teams who can spend more time building the fun stuff instead of tracking down bugs.

Speaking of engineers, visibility and management of data flows plays a critical role in the development process. Putting these tools into the hands of our engineers allows for real time feedback of data flowing through QA systems and easy triggers for re-sending and moving test data through these systems while building features and troubleshooting bugs.

*Bonus*

Increasing the visibility into our data journey can help us in ensuring we are compliant with regulations such as GDPR and HIPAA. We can get early warning and validate that sensitive and private PII data only exists in systems where it is authorized to be. Through the improved tracability and management actions, we are able to gain confidence that we are protecting our user's data and complying with data privacy requests.

## Isn't This Expensive?

Yes. Definitely. However, I believe that designing with this mindset from the beginning will help keep costs and engineering effort within manageable limits. When working with large data sets, the querying of this data in real time becomes much more costly (both in money and time). While I do acknowledge this and suggest spending design time thinking of how to best query large datasets and weighing the pros and cons of real time reporting vs scheduled aggregations that this tooling can read for less load on crictical systems, I truly believe that the value of this visibility and management tooling speaks for itself. Especially when we have large customers feeding us millions of documents every day and expecting that updates are reflected in real time in our products and services.

The ideas discussed here require more effort up front to build but aim to save much more time later on. The "fail fast and iterate" approach may want to write this off at first, but I would argue that this tooling *assists* in that iterative approach by giving teams visibility in the behavior of the solutions they are rapidly building and allow for more confidence in iterations and further product MVPs.

*Data nerds unite!*
