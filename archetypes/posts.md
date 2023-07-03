---
author:
  name: "Ross Brandon"
date: {{ dateFormat .Site.Params.dateformNum .Date }}
publishdate: {{ dateFormat .Site.Params.dateformNum .Date }}
linktitle: "{{ replace .Name "-" " " | title }}"
type:
  - post
title: "{{ replace .Name "-" " " | title }}"
weight: 10
draft: true
categories:
  - new-category
tags:
  - new-tag
---
