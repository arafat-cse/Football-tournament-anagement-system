export type SportType = "football";
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
  registrationInstruction: string;
  bannerUrl?: string;
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
  logoUrl?: string;
  ownerName: string;
  ownerPhone: string;
  budget: number;
  spent: number;
  registrationStatus?: RegistrationStatus;
  jerseyColor: string;
  tournamentSlug: string;
};

export type TeamPlayer = {
  id: number;
  teamId: number;
  tournamentSlug: string;
  player: Player;
  price: number;
  source: "auction" | "manual_override";
  assignedAt?: string;
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
  photoUrl?: string;
  basePrice: number;
  finalPrice?: number;
  teamId?: number;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  auctionStatus: AuctionStatus;
  tournamentSlug: string;
};

export type Registration = Player & {
  documentId?: string;
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
  tournamentSlug: string;
  displayStatus: "live" | "completed";
  player?: Player;
};

export type SponsorTier = "title" | "gold" | "silver" | "partner";

export type Sponsor = {
  id: number;
  name: string;
  logoUrl?: string;
  website?: string;
  tier: SponsorTier;
  tournamentSlug?: string;
  isActive?: boolean;
};
