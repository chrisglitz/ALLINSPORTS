/**
 * Prisma Seed Script
 * Populates database with sample NFL data for development/testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Sport
  const nflSport = await prisma.sport.upsert({
    where: { slug: 'nfl' },
    update: {},
    create: {
      name: 'NFL',
      slug: 'nfl',
      isActive: true,
    },
  });
  console.log('✓ Created sport: NFL');

  // Create League
  const currentSeason = new Date().getFullYear();
  const nflLeague = await prisma.league.upsert({
    where: { slug: 'nfl' },
    update: {},
    create: {
      sportId: nflSport.id,
      name: 'National Football League',
      slug: 'nfl',
      season: currentSeason,
      isActive: true,
    },
  });
  console.log(`✓ Created league: NFL ${currentSeason}`);

  // Create Venues
  const venues = [
    {
      name: 'Arrowhead Stadium',
      slug: 'arrowhead-stadium',
      city: 'Kansas City',
      state: 'MO',
      isDome: false,
      latitude: 39.0489,
      longitude: -94.4839,
    },
    {
      name: 'Highmark Stadium',
      slug: 'highmark-stadium',
      city: 'Buffalo',
      state: 'NY',
      isDome: false,
      latitude: 42.7738,
      longitude: -78.7870,
    },
    {
      name: "Levi's Stadium",
      slug: 'levis-stadium',
      city: 'Santa Clara',
      state: 'CA',
      isDome: false,
      latitude: 37.4032,
      longitude: -121.9698,
    },
    {
      name: 'Lincoln Financial Field',
      slug: 'lincoln-financial-field',
      city: 'Philadelphia',
      state: 'PA',
      isDome: false,
      latitude: 39.9008,
      longitude: -75.1675,
    },
  ];

  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {},
      create: venue,
    });
  }
  console.log(`✓ Created ${venues.length} venues`);

  // Create Teams
  const teams = [
    {
      name: 'Kansas City Chiefs',
      city: 'Kansas City',
      abbreviation: 'KC',
      slug: 'kc-chiefs',
      venueSlug: 'arrowhead-stadium',
    },
    {
      name: 'Buffalo Bills',
      city: 'Buffalo',
      abbreviation: 'BUF',
      slug: 'buffalo-bills',
      venueSlug: 'highmark-stadium',
    },
    {
      name: 'San Francisco 49ers',
      city: 'San Francisco',
      abbreviation: 'SF',
      slug: 'sf-49ers',
      venueSlug: 'levis-stadium',
    },
    {
      name: 'Philadelphia Eagles',
      city: 'Philadelphia',
      abbreviation: 'PHI',
      slug: 'phi-eagles',
      venueSlug: 'lincoln-financial-field',
    },
  ];

  const createdTeams = [];
  for (const team of teams) {
    const venue = await prisma.venue.findUnique({
      where: { slug: team.venueSlug },
    });

    const createdTeam = await prisma.team.upsert({
      where: {
        leagueId_slug: {
          leagueId: nflLeague.id,
          slug: team.slug,
        },
      },
      update: {},
      create: {
        leagueId: nflLeague.id,
        name: team.name,
        city: team.city,
        abbreviation: team.abbreviation,
        slug: team.slug,
        venueId: venue?.id,
      },
    });
    createdTeams.push(createdTeam);
  }
  console.log(`✓ Created ${teams.length} teams`);

  // Create sample games
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const games = [
    {
      homeTeam: createdTeams[0], // KC
      awayTeam: createdTeams[1], // BUF
      scheduledTime: new Date(tomorrow.setHours(13, 0, 0, 0)),
      week: 18,
    },
    {
      homeTeam: createdTeams[2], // SF
      awayTeam: createdTeams[3], // PHI
      scheduledTime: new Date(tomorrow.setHours(16, 30, 0, 0)),
      week: 18,
    },
  ];

  const createdGames = [];
  for (const game of games) {
    const venue = await prisma.venue.findUnique({
      where: { id: game.homeTeam.venueId! },
    });

    const createdGame = await prisma.game.upsert({
      where: {
        leagueId_homeTeamId_awayTeamId_scheduledTime: {
          leagueId: nflLeague.id,
          homeTeamId: game.homeTeam.id,
          awayTeamId: game.awayTeam.id,
          scheduledTime: game.scheduledTime,
        },
      },
      update: {},
      create: {
        leagueId: nflLeague.id,
        homeTeamId: game.homeTeam.id,
        awayTeamId: game.awayTeam.id,
        venueId: venue?.id,
        scheduledTime: game.scheduledTime,
        week: game.week,
        seasonType: 'REG',
        status: 'scheduled',
        dataSource: 'seed',
        dataFetchedAt: new Date(),
      },
    });
    createdGames.push(createdGame);
  }
  console.log(`✓ Created ${games.length} games`);

  // Create sample players
  const players = [
    {
      teamId: createdTeams[0].id, // KC
      firstName: 'Patrick',
      lastName: 'Mahomes',
      position: 'QB',
      jerseyNumber: '15',
    },
    {
      teamId: createdTeams[0].id,
      firstName: 'Travis',
      lastName: 'Kelce',
      position: 'TE',
      jerseyNumber: '87',
    },
    {
      teamId: createdTeams[1].id, // BUF
      firstName: 'Josh',
      lastName: 'Allen',
      position: 'QB',
      jerseyNumber: '17',
    },
  ];

  for (const player of players) {
    await prisma.player.upsert({
      where: {
        teamId_firstName_lastName: {
          teamId: player.teamId,
          firstName: player.firstName,
          lastName: player.lastName,
        },
      },
      update: {},
      create: player,
    });
  }
  console.log(`✓ Created ${players.length} players`);

  // Create sample odds snapshots
  for (const game of createdGames) {
    await prisma.oddsSnapshot.create({
      data: {
        gameId: game.id,
        providerName: 'DraftKings',
        homeMoneyline: -180,
        awayMoneyline: 155,
        homeSpread: -3.5,
        homeSpreadOdds: -110,
        awaySpread: 3.5,
        awaySpreadOdds: -110,
        overUnder: 47.5,
        overOdds: -110,
        underOdds: -110,
        dataSource: 'seed',
        dataFetchedAt: new Date(),
      },
    });
  }
  console.log('✓ Created odds snapshots');

  // Create sample weather snapshots for outdoor venues
  for (const game of createdGames) {
    const venue = await prisma.venue.findUnique({
      where: { id: game.venueId! },
    });

    if (venue && !venue.isDome) {
      await prisma.weatherSnapshot.create({
        data: {
          venueId: venue.id,
          gameId: game.id,
          forecastTime: game.scheduledTime,
          temperature: 35,
          feelsLike: 28,
          windSpeed: 12,
          windGust: 18,
          windDirection: 'NW',
          precipProbability: 20,
          precipType: 'none',
          humidity: 65,
          condition: 'Partly Cloudy',
          severityScore: 35,
          dataSource: 'seed',
          dataFetchedAt: new Date(),
        },
      });
    }
  }
  console.log('✓ Created weather snapshots');

  // Create sample ELO ratings
  const eloRatings = [
    { teamId: createdTeams[0].id, rating: 1625 }, // KC
    { teamId: createdTeams[1].id, rating: 1580 }, // BUF
    { teamId: createdTeams[2].id, rating: 1560 }, // SF
    { teamId: createdTeams[3].id, rating: 1545 }, // PHI
  ];

  for (const elo of eloRatings) {
    await prisma.teamStrengthElo.upsert({
      where: {
        teamId_season_week: {
          teamId: elo.teamId,
          season: currentSeason,
          week: 18,
        },
      },
      update: {},
      create: {
        teamId: elo.teamId,
        season: currentSeason,
        week: 18,
        eloRating: elo.rating,
        dataSource: 'seed',
      },
    });
  }
  console.log('✓ Created ELO ratings');

  // Create referee crew
  await prisma.refereeCrew.upsert({
    where: { refereeName: 'Brad Allen' },
    update: {},
    create: {
      refereeName: 'Brad Allen',
      avgPenaltiesPerGame: 12.3,
      homeFavoritism: 0.2,
      affectsTotal: -0.5,
      season: currentSeason,
    },
  });
  console.log('✓ Created referee crew');

  // Create default user settings
  await prisma.userSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      enableSocialSignals: false,
      enableMarketDisagreement: false,
      enableRumorSignals: false,
      enablePersonalContext: false,
      preferredOddsFormat: 'AMERICAN',
      defaultSport: 'nfl',
    },
  });
  console.log('✓ Created default user settings');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
