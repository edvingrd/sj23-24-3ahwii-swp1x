const { faker } = require('@faker-js/faker');  // Korrigierter Import von faker
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userCountTarget = 10;
const trackCountTarget = 50;
const watchlistCountTarget = 25;
const watchlistFillTarget = 15;

async function seed() {
    // create users
    const userCountActual = await prisma.benutzer.count();
    for (let i = 1; i <= userCountTarget - userCountActual; i++) {
        const user = {
            fullname: faker.name.fullName(),
            email: faker.internet.email(),
        };
        await prisma.benutzer.create({
            data: user,
        });
    }
    console.log(`Created ${userCountTarget - userCountActual} Benutzer, now are ${await prisma.benutzer.count()} Benutzer in DB`);

    // create tracks
    const trackCountActual = await prisma.track.count();
    for (let i = 1; i <= trackCountTarget - trackCountActual; i++) {
        const track = {
            name: faker.music.songName(),
            duration: Math.floor(Math.random() * 300),
            genre: faker.music.genre(),
            artist: faker.name.fullName(),
        };
        await prisma.track.create({
            data: track,
        });
    }
    console.log(`Created ${trackCountTarget - trackCountActual} tracks, now are ${await prisma.track.count()} Tracks in DB`);

    // create watchlists
    const userIds = (await prisma.benutzer.findMany({ select: { id: true } })).map((_) => _.id);
    const watchlistCountActual = await prisma.watchlist.count();
    for (let i = 1; i <= watchlistCountTarget - watchlistCountActual; i++) {
        await prisma.watchlist.create({
            data: {
                name: faker.word.noun(),
                createdAt: faker.date.recent(),
                benutzer: {
                    connect: {
                        id: userIds[Math.floor(Math.random() * userIds.length)],
                    },
                },
            },
        });
    }
    console.log(`Created ${watchlistCountTarget - watchlistCountActual} watchlists, now are ${await prisma.watchlist.count()} Watchlists in DB`);

    // fill watchlists
    const watchlistIds = (await prisma.watchlist.findMany({ select: { id: true } })).map((_) => _.id);
    const allTracks = await prisma.track.findMany({ select: { id: true } });

    // iterate over all watchlists
    for (let watchListCuid of watchlistIds) {
        const trackCountInWatchlistI = await prisma.track.count({
            where: {
                watchLists: { some: { id: watchListCuid } },
            },
        });
        console.log(`${trackCountInWatchlistI} tracks in Watchlist ${watchListCuid}`);

        if (trackCountInWatchlistI >= watchlistFillTarget) {
            console.log('continuing ..');
            continue;
        }

        const createCount = Math.max(0, Math.floor(Math.random() * (watchlistFillTarget - trackCountInWatchlistI)));
        if (createCount <= 0) {
            continue;
        }

        const rndTracklist = Array.from(new Array(createCount)).map(
            () => allTracks[Math.floor(Math.random() * allTracks.length)]
        );

        await prisma.watchlist.update({
            where: {
                id: watchListCuid,
            },
            data: {
                tracks: { connect: rndTracklist },
            },
        });
        console.log(`created ${createCount} tracks in watchlist ${watchListCuid}`);
    }
}

function handleError(e) {
    console.error(`FEHLER: ${e.message}`);
}

seed()
    .then(() => console.log('done seeding'))
    .catch(handleError);

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

if (process.argv.length != 3) {
    console.log('no user provided, exiting');
    process.exit(1);
}

const userName = process.argv[2].trim();
if (!userName) {
    console.log('empty username provided, exiting');
    process.exit(1);
}

console.log(`finding watchlist names for ${userName}`);

async function getWatchlistNamesForUser(userName) {
    return await prisma.watchlist.findMany({
        select: {
            id: true,
            name: true,
        },
        where: {
            benutzer: {
                fullname: userName,
            },
        },
    });
}

async function tracksFromWatchlist(id) {
    return await prisma.track.findMany({
        where: {
            watchLists: {
                some: { id: id },
            },
        },
    });
}

async function main() {
    const lists = await getWatchlistNamesForUser(userName);
    for (let wl of lists) {
        const tracks = await tracksFromWatchlist(wl.id);
        console.log(`${userName}'s Watchlist ${wl.name} ... ${tracks.length} tracks`);
        for (let t of tracks) {
            console.log(`    ${t.name} by ${t.artist} (${t.duration} secs)`);
        }
    }
}

main();
