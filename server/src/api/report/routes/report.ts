// @ts-nocheck
export default {
  routes: [
    { method: 'GET', path: '/reports/players.pdf', handler: 'report.playersPdf', config: { auth: false, policies: [] } },
    { method: 'GET', path: '/reports/team-squad.pdf', handler: 'report.teamSquadPdf', config: { auth: false, policies: [] } },
    { method: 'GET', path: '/reports/registrations.xlsx', handler: 'report.registrationsExcel', config: { auth: false, policies: [] } },
    { method: 'GET', path: '/reports/payments.xlsx', handler: 'report.paymentsExcel', config: { auth: false, policies: [] } },
    { method: 'GET', path: '/exports/players', handler: 'report.playersPdf', config: { auth: false, policies: [] } },
    { method: 'GET', path: '/exports/team-squad', handler: 'report.teamSquadPdf', config: { auth: false, policies: [] } },
    { method: 'GET', path: '/exports/registrations', handler: 'report.registrationsExcel', config: { auth: false, policies: [] } },
    { method: 'GET', path: '/exports/payments', handler: 'report.paymentsExcel', config: { auth: false, policies: [] } },
  ],
};
