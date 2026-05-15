export type SportType = "football" | "cricket";
export type TournamentStatus = "draft" | "registration_open" | "registration_closed" | "auction" | "live" | "completed";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "paid" | "rejected" | "refunded";
export type AuctionStatus = "pool" | "sold" | "unsold";

export type Tournament = {
  id: number;
  name: string;
  slug: string;
  sportType: SportType;
  location: string;
  startDate: string;
  endDate: string;
  registrationFee: number;
  requiresPayment: boolean;
  auctionDate: string;
  rules: string;
  status: TournamentStatus;
  teamCount: number;
  playerCount: number;
};

export type Team = {
  id: number;
  name: string;
  ownerName: string;
  ownerPhone: string;
  budget: number;
  spent: number;
  jerseyColor: string;
  tournamentSlug: string;
};

export type Player = {
  id: number;
  name: string;
  phone: string;
  email: string;
  age: number;
  address: string;
  role: string;
  experience: string;
  basePrice: number;
  finalPrice?: number;
  teamId?: number;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  auctionStatus: AuctionStatus;
  tournamentSlug: string;
};

export type Registration = Player & {
  paymentMethod: "bkash" | "nagad" | "rocket" | "bank" | "cash" | "waived";
  transactionId: string;
  amount: number;
  rejectionReason?: string;
  createdAt: string;
};

export type Bid = {
  id: number;
  auctionId: number;
  playerId: number;
  teamId: number;
  amount: number;
  isWinning: boolean;
};

export type Auction = {
  id: number;
  title: string;
  tournamentSlug: string;
  status: "scheduled" | "live" | "paused" | "completed";
  startsAt: string;
  bids: Bid[];
};
