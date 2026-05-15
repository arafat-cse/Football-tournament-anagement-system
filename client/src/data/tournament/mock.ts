import type { Auction, Player, Registration, Team, Tournament } from "./types";

export const tournaments: Tournament[] = [
  {
    id: 1,
    name: "Dhaka Premier Cup 2026",
    slug: "dhaka-premier-cup-2026",
    sportType: "football",
    location: "Dhaka",
    startDate: "2026-06-12",
    endDate: "2026-06-28",
    registrationFee: 500,
    requiresPayment: true,
    auctionDate: "2026-06-05T15:00:00.000Z",
    rules: "Open registration, verified payments, live auction and team budget control.",
    status: "registration_open",
    teamCount: 3,
    playerCount: 8,
  },
  {
    id: 2,
    name: "Chattogram Cricket Bash",
    slug: "chattogram-cricket-bash",
    sportType: "cricket",
    location: "Chattogram",
    startDate: "2026-07-08",
    endDate: "2026-07-20",
    registrationFee: 700,
    requiresPayment: true,
    auctionDate: "2026-06-25T14:00:00.000Z",
    rules: "Cricket auction squads with all-rounder, batter, bowler and keeper roles.",
    status: "auction",
    teamCount: 4,
    playerCount: 12,
  },
];

export const teams: Team[] = [
  { id: 1, name: "Mirpur Strikers", ownerName: "Rahim Uddin", ownerPhone: "01711000001", budget: 50000, spent: 18500, jerseyColor: "#16a34a", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 2, name: "Gulshan Royals", ownerName: "Nadia Ahmed", ownerPhone: "01711000002", budget: 50000, spent: 12000, jerseyColor: "#2563eb", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 3, name: "Old Dhaka Titans", ownerName: "Sajid Khan", ownerPhone: "01711000003", budget: 50000, spent: 0, jerseyColor: "#f97316", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 4, name: "Port City Sixers", ownerName: "Morshed Alam", ownerPhone: "01811000001", budget: 80000, spent: 24500, jerseyColor: "#0891b2", tournamentSlug: "chattogram-cricket-bash" },
];

export const players: Player[] = [
  { id: 1, name: "Arif Hossain", phone: "01712000001", email: "arif@example.com", age: 24, address: "Mirpur", role: "Forward", experience: "District league", basePrice: 7000, finalPrice: 10500, teamId: 1, registrationStatus: "approved", paymentStatus: "paid", auctionStatus: "sold", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 2, name: "Tanvir Islam", phone: "01712000002", email: "tanvir@example.com", age: 26, address: "Uttara", role: "Midfielder", experience: "University team", basePrice: 6000, finalPrice: 8000, teamId: 1, registrationStatus: "approved", paymentStatus: "paid", auctionStatus: "sold", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 3, name: "Rafi Chowdhury", phone: "01712000003", email: "rafi@example.com", age: 23, address: "Dhanmondi", role: "Goalkeeper", experience: "Club reserve", basePrice: 5000, registrationStatus: "pending", paymentStatus: "pending", auctionStatus: "pool", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 4, name: "Mehedi Hasan", phone: "01712000004", email: "mehedi@example.com", age: 28, address: "Badda", role: "Defender", experience: "Semi pro", basePrice: 5500, finalPrice: 12000, teamId: 2, registrationStatus: "approved", paymentStatus: "paid", auctionStatus: "sold", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 5, name: "Naim Sheikh", phone: "01712000005", email: "naim@example.com", age: 21, address: "Mohakhali", role: "Winger", experience: "Academy", basePrice: 4500, registrationStatus: "approved", paymentStatus: "paid", auctionStatus: "pool", tournamentSlug: "dhaka-premier-cup-2026" },
  { id: 6, name: "Sabbir Rahman", phone: "01812000001", email: "sabbir@example.com", age: 27, address: "Agrabad", role: "All-rounder", experience: "T20 local cup", basePrice: 9000, finalPrice: 14500, teamId: 4, registrationStatus: "approved", paymentStatus: "paid", auctionStatus: "sold", tournamentSlug: "chattogram-cricket-bash" },
];

export const registrations: Registration[] = players.map((player, index) => ({
  ...player,
  paymentMethod: index % 2 ? "nagad" : "bkash",
  transactionId: `TXN2026${index + 101}`,
  amount: player.tournamentSlug === "chattogram-cricket-bash" ? 700 : 500,
  rejectionReason: player.registrationStatus === "rejected" ? "Incomplete payment information" : undefined,
  createdAt: `2026-05-${String(5 + index).padStart(2, "0")}T10:00:00.000Z`,
}));

export const auctions: Auction[] = [
  {
    id: 1,
    title: "Dhaka Premier Cup Auction",
    tournamentSlug: "dhaka-premier-cup-2026",
    status: "live",
    startsAt: "2026-06-05T15:00:00.000Z",
    bids: [
      { id: 1, auctionId: 1, playerId: 5, teamId: 1, amount: 6000, isWinning: false },
      { id: 2, auctionId: 1, playerId: 5, teamId: 2, amount: 7000, isWinning: true },
    ],
  },
];
