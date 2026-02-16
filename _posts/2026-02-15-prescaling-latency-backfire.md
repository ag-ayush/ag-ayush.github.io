---
layout: post
title: Scaling Our Microservice Made Latency Worse—Here's How We Fixed It
date: 2026-02-15 12:00:00
description: We prescale for EC2 headroom and regional failover during business-critical times. Low traffic left DynamoDB connections idle and the HTTP client we'd chosen for fast pod startup closed them in ~5s. Here's how we fixed p99 with configurable idle timeout and TCP keepalive.
categories: engineering
tags:
  - dynamodb
  - performance
  - aws
  - architecture
---

We scale for reliability, but low traffic can leave connections idle—and idle connections will eventually be terminated. When that happens, the extra capacity can backfire.

## The Problem

We have a service that's high-throughput, up to ~50k TPS, and latency-sensitive. It sits at the bottom of the stack—a foundational dependency that many upstream services call, so its latency compounds. 99% of traffic to this service is read traffic, and the remainder involves writes. The write path is where the problem showed up.

We prescale for seasonal peaks so we're not iced out of EC2 capacity and so we have capacity ready for regional failover during business-critical times. The tradeoff is that we often have more pods than current traffic needs. Many pods see low or sporadic traffic, and on the write path that means long gaps between requests.

The chart below shows write TPS on a single pod over a 5-minute window when the service is scaled up. Gaps of 30 seconds or more between writes are evident.

{% include figure.liquid loading="eager" path="assets/img/write_tps_single_pod_5m.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Write TPS on a single pod over a 5-minute window when scaled up. Gaps of 30+ seconds between writes are common." %}

We observed elevated p99 latency in production from that prescaled capacity. We traced the increase in latency to DynamoDB writes and from there to the connection lifecycle of the DynamoDB client. Here's the chain we saw:

1. **Idle connections closed.** On pods with little traffic, idle DynamoDB connections were closed.
2. **Short client timeout.** We had chosen UrlConnectionHttpClient for its light weight and quick start time, which let pods come up slightly faster than with ApacheHttpClient. That client closes idle connections after ~5 seconds and doesn't let you configure it ([GitHub #3941](https://github.com/aws/aws-sdk-java-v2/issues/3941)).
3. **New connections on demand.** When a request finally arrived, it often had to establish a new connection to DynamoDB. Creating new TCP connections is expensive—cold connections cost on the order of 40–80 ms; reused connections are ~1–3 ms. At scale, that gap is massive.
4. **Latency spike.** That setup cost showed up in p99.

What we missed: we'd prescaled for reliability but hadn't kept connections warm. The HTTP client we'd chosen for fast startup had a short idle timeout, which made the prescaling backfire.

## The Solution

The fix was an HTTP client with configurable idle timeout and TCP keepalive.

We made three changes:

1. **Switch to ApacheHttpClient** for all DynamoDB clients (we switched everywhere to maintain consistency).
2. **Enable TCP keepalive** so idle connections are less likely to be torn down by the network or the server.
3. **Set a configurable connection idle timeout** (e.g. 60 seconds) so we control when the client closes idle connections instead of being stuck at ~5s.

No synthetic warmup traffic, no change to scaling policy—just picking the right HTTP client and tuning connection lifecycle.

## Implementation Details

### Why the write path?

The service uses separate DynamoDB clients for reads and writes, with different timeout and retry SLAs. The **read client** is tuned for low latency (aggressive retries) and is used in health checks that run at least every 30 seconds, so its connections stay warm. The **write client** is tuned for reliability (longer timeouts so writes can complete), is used less often, and has no regular traffic like the health check. Its connections idle out. When a write arrives, it often pays new-connection cost. So the increase in p99 was coming from the write path.

### Why we were on UrlConnectionHttpClient in the first place

Engineers had chosen UrlConnectionHttpClient for its light weight and quick start time, so pods could come up slightly faster than with ApacheHttpClient. That helped with cold start. It was the wrong tradeoff for this failure mode. UrlConnectionHttpClient has a ~5 second idle connection timeout that isn't configurable. Under prescale and low traffic, connections were closing quickly and new requests were paying full setup cost. The right fix was connection lifecycle (keepalive + configurable idle timeout), not a lighter or faster-starting client.

### Options we didn't take

**Adding writes to the periodic app health checks**, like the reads already have. That would keep the write client's connections warm. We didn't do it. The cost compounds. One write every 30 seconds × 200 pods per region × multiple regions is a lot of extra throughput and table load for the benefit.

**Scheduled scaling.** Scale up only when we expect traffic to be high. The organization is working on this. It wasn't available to us for this fix, so we didn't depend on it.

## Results

Overall P99 improved from 220ms to 100ms. We stopped observing latency increases when scaling up. Some upstream clients noticed an improvement of 200ms due to compounded benefit from multiple calls to our service.

{% include figure.liquid loading="eager" path="assets/img/upstream_latency_after_fixes.png" class="img-fluid rounded z-depth-1" zoomable=true caption="One upstream client's p95 and p99 latency improvement after the fix." %}

## Conclusion

We added capacity for business-critical traffic peaks, but prescaling without keeping connections warm can backfire. When traffic stayed low, connections sat idle and the HTTP client we'd chosen for fast pod startup closed them in ~5 seconds, so new requests paid the connection-setup cost and p99 went up. The fix was switching to an HTTP client with configurable idle timeout and TCP keepalive, not synthetic traffic or a different scaling strategy.

For services like ours—high-throughput and latency-sensitive—connection lifecycle matters as much as capacity. The same choice that helped with cold start (a lighter client) was the wrong one once idle connections started getting terminated.
