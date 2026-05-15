# Database Schema and Content-Type Plan

## Core Ownership

- Tournament owns teams, registrations, players, payments, auctions, matches, sponsors and notifications.
- Team belongs to one tournament and has many bids and team-player assignments.
- Player belongs to one tournament and may have one active team assignment per tournament.
- Registration captures submitted player and payment information before approval.
- Payment belongs to a registration and tournament.
- Auction belongs to a tournament and has many bids.
- Bid belongs to auction, player and team.
- TeamPlayer is the squad assignment record created by auction finalization or admin override.
- ActionLog records approval, rejection, bidding and sale actions.

## Business Rules

- `registration.approve` rejects approval when the tournament requires payment and `paymentStatus` is not `paid`.
- Approved registrations create or update a Player and set the player auction status to `pool`.
- `auction.bid` rejects non-approved players, sold players, cross-tournament bids, bids below base price and bids beyond team remaining budget.
- `auction.finalizeSale` creates TeamPlayer, marks Player as sold and increments Team.spent.
- Duplicate player assignment in the same tournament is blocked unless `override` is passed.

## Export Filters

Reports support these filters through query strings:

- player PDF: `tournament`, `status`, `team`
- squad PDF: `tournament`, `team`
- registrations Excel: `tournament`, `status`, `paymentStatus`
- payments Excel: `tournament`, `status`, `from`, `to`
