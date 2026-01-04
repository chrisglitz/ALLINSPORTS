/**
 * Mock Weather Adapter
 * Generates realistic weather forecast data for testing
 */

import { AbstractBaseAdapter } from '../base-adapter';
import {
  WeatherAdapter,
  FetchWeatherParams,
  WeatherForecast,
  ProviderType,
} from '../types';

const CONDITIONS = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Heavy Rain', 'Snow', 'Light Snow'];
const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export class MockWeatherAdapter extends AbstractBaseAdapter<FetchWeatherParams, WeatherForecast[]> implements WeatherAdapter {
  constructor() {
    super({
      providerName: 'MockWeatherAdapter',
      providerType: ProviderType.WEATHER,
      version: '1.0.0',
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
      },
    });
  }

  async fetch(params: FetchWeatherParams) {
    await this.sleep(80); // Simulate network latency

    const forecasts: WeatherForecast[] = [];

    // Generate hourly forecasts for the next 6 hours
    for (let i = 0; i < 6; i++) {
      const forecastTime = new Date(params.forecastTime);
      forecastTime.setHours(forecastTime.getHours() + i);

      forecasts.push(this.generateForecast(
        params.latitude,
        params.longitude,
        forecastTime
      ));
    }

    return this.createResponse(forecasts, new Date());
  }

  private generateForecast(
    latitude: number,
    longitude: number,
    forecastTime: Date
  ): WeatherForecast {
    // Generate realistic weather based on time of year and location
    const month = forecastTime.getMonth();
    const isWinter = month < 2 || month > 10;
    const isSummer = month > 4 && month < 9;

    // Temperature ranges
    let baseTemp = 50;
    if (isWinter) baseTemp = 30;
    if (isSummer) baseTemp = 70;

    const temperature = baseTemp + Math.random() * 20 - 10;
    const windSpeed = Math.random() * 20 + 2;
    const windGust = windSpeed + Math.random() * 10;
    const precipProb = Math.random() * 100;

    let condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    let precipType: 'rain' | 'snow' | 'sleet' | 'none' = 'none';

    if (precipProb > 70) {
      if (temperature < 35) {
        condition = 'Snow';
        precipType = 'snow';
      } else {
        condition = 'Rain';
        precipType = 'rain';
      }
    }

    return {
      venueName: 'Mock Stadium',
      latitude,
      longitude,
      forecastTime,
      issuedAt: new Date(),
      temperature: Math.round(temperature),
      feelsLike: Math.round(temperature - (windSpeed * 0.5)),
      windSpeed: Math.round(windSpeed * 10) / 10,
      windGust: Math.round(windGust * 10) / 10,
      windDirection: WIND_DIRECTIONS[Math.floor(Math.random() * WIND_DIRECTIONS.length)],
      precipProbability: Math.round(precipProb),
      precipType,
      humidity: Math.round(Math.random() * 40 + 40),
      condition,
      visibility: Math.round(Math.random() * 5 + 5),
    };
  }

  protected async performHealthCheck(): Promise<void> {
    await this.sleep(50);
  }
}
