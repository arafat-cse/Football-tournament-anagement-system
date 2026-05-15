export default {
  routes: [
    { method: 'GET', path: '/reports/players.pdf', handler: 'report.playersPdf', config: { policies: [] } },
    { method: 'GET', path: '/reports/team-squad.pdf', handler: 'report.teamSquadPdf', config: { policies: [] } },
    { method: 'GET', path: '/reports/registrations.xlsx', handler: 'report.registrationsExcel', config: { policies: [] } },
    { method: 'GET', path: '/reports/payments.xlsx', handler: 'report.paymentsExcel', config: { policies: [] } },
  ],
};
