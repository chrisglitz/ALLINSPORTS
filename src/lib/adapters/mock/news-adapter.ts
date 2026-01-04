/**
 * Mock News Adapter
 * Generates realistic news articles for testing
 */

import { AbstractBaseAdapter } from '../base-adapter';
import {
  NewsAdapter,
  FetchNewsParams,
  NewsArticle,
  ProviderType,
} from '../types';

const HEADLINES = [
  'Star QB returns to practice after injury scare',
  'Defensive coordinator announces new scheme for upcoming game',
  'Running back achieves milestone in team practice',
  'Head coach addresses media on team preparation',
  'Key player listed as questionable for Sunday',
  'Team announces roster moves ahead of game',
  'Offensive line shuffle expected this weekend',
  'Weather concerns loom for outdoor matchup',
  'Rivalry renewed as teams prepare to clash',
  'Special teams unit shows improvement in practice',
];

const SOURCES = ['ESPN', 'NFL.com', 'The Athletic', 'Sports Illustrated', 'Bleacher Report'];

export class MockNewsAdapter extends AbstractBaseAdapter<FetchNewsParams, NewsArticle[]> implements NewsAdapter {
  constructor() {
    super({
      providerName: 'MockNewsAdapter',
      providerType: ProviderType.NEWS,
      version: '1.0.0',
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
      },
    });
  }

  async fetch(params: FetchNewsParams) {
    await this.sleep(90); // Simulate network latency

    const articles: NewsArticle[] = [];
    const numArticles = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < numArticles; i++) {
      const publishedAt = new Date();
      publishedAt.setHours(publishedAt.getHours() - Math.floor(Math.random() * 48));

      const headline = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
      const sourceName = SOURCES[Math.floor(Math.random() * SOURCES.length)];

      articles.push({
        id: `article_${i}`,
        headline,
        snippet: `${headline} - Read more about the latest developments and what it means for the upcoming game.`,
        sourceUrl: `https://example.com/article/${i}`,
        sourceName,
        publishedAt,
        sentiment: {
          score: Math.random() * 2 - 1, // -1 to 1
          confidence: this.randomConfidence(),
        },
        relevanceScore: Math.round(Math.random() * 40 + 60), // 60-100
        expiresAt: new Date(publishedAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    return this.createResponse(articles, new Date());
  }

  private randomConfidence(): 'HIGH' | 'MEDIUM' | 'LOW' {
    const rand = Math.random();
    if (rand < 0.33) return 'LOW';
    if (rand < 0.66) return 'MEDIUM';
    return 'HIGH';
  }

  protected async performHealthCheck(): Promise<void> {
    await this.sleep(50);
  }
}
