-- CreateTable
CREATE TABLE "Benutzer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "benutzerId" TEXT NOT NULL,
    CONSTRAINT "Watchlist_benutzerId_fkey" FOREIGN KEY ("benutzerId") REFERENCES "Benutzer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "artist" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TrackToWatchlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TrackToWatchlist_A_fkey" FOREIGN KEY ("A") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TrackToWatchlist_B_fkey" FOREIGN KEY ("B") REFERENCES "Watchlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Benutzer_email_key" ON "Benutzer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_TrackToWatchlist_AB_unique" ON "_TrackToWatchlist"("A", "B");

-- CreateIndex
CREATE INDEX "_TrackToWatchlist_B_index" ON "_TrackToWatchlist"("B");
