const pdfBuffer = (title: string, rows: string[][]) => {
  const lines = [title, '', ...rows.map((row) => row.join(' | '))];
  const body = lines.map((line, index) => `BT /F1 10 Tf 40 ${780 - index * 16} Td (${line.replace(/[()]/g, '')}) Tj ET`).join('\n');
  return Buffer.from(`%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${body.length} >> stream
${body}
endstream endobj
trailer << /Root 1 0 R >>
%%EOF`);
};

const excelXml = (sheetName: string, columns: { header: string; key: string }[], rows: any[]) => {
  const xmlRows = [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => row[column.key] ?? '')),
  ].map((cells) => `<Row>${cells.map((cell) => `<Cell><Data ss:Type="String">${String(cell).replace(/[<&>]/g, '')}</Data></Cell>`).join('')}</Row>`).join('');
  return Buffer.from(`<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${sheetName}"><Table>${xmlRows}</Table></Worksheet>
</Workbook>`);
};

const sendPdf = (ctx: any, title: string, rows: string[][]) => {
  ctx.set('Content-Type', 'application/pdf');
  ctx.set('Content-Disposition', `attachment; filename="${title.toLowerCase().replace(/\s+/g, '-')}.pdf"`);
  ctx.body = pdfBuffer(title, rows);
};

const sendWorkbook = (ctx: any, filename: string, sheetName: string, columns: { header: string; key: string }[], rows: any[]) => {
  ctx.set('Content-Type', 'application/vnd.ms-excel');
  ctx.set('Content-Disposition', `attachment; filename="${filename.replace('.xlsx', '.xls')}"`);
  ctx.body = excelXml(sheetName, columns, rows);
};

export default {
  async playersPdf(ctx: any) {
    const { tournament, status, team } = ctx.query;
    const filters: any = {};
    if (tournament) filters.tournament = tournament;
    if (status) filters.registrationStatus = status;

    const players = await strapi.entityService.findMany('api::player.player', {
      filters,
      populate: ['tournament', 'teamPlayers.team'],
      sort: ['name:asc'],
      limit: 1000,
    });

    const rows = players
      .filter((player: any) => !team || player.teamPlayers?.some((item: any) => String(item.team?.id) === String(team)))
      .map((player: any) => [player.name, player.role || '-', player.phone || '-', player.registrationStatus, player.paymentStatus, player.auctionStatus]);
    sendPdf(ctx, 'Tournament Player List', [['Name', 'Role', 'Phone', 'Registration', 'Payment', 'Auction'], ...rows]);
  },

  async teamSquadPdf(ctx: any) {
    const { tournament, team } = ctx.query;
    const filters: any = {};
    if (tournament) filters.tournament = tournament;
    if (team) filters.team = team;

    const squad = await strapi.entityService.findMany('api::team-player.team-player', {
      filters,
      populate: ['team', 'player', 'tournament'],
      sort: ['team.name:asc'],
      limit: 1000,
    });

    const rows = squad.map((item: any) => [item.team?.name || '-', item.player?.name || '-', item.player?.role || '-', String(item.price || 0), item.source]);
    sendPdf(ctx, 'Team Wise Squad', [['Team', 'Player', 'Role', 'Price', 'Source'], ...rows]);
  },

  async registrationsExcel(ctx: any) {
    const { tournament, status, paymentStatus } = ctx.query;
    const filters: any = {};
    if (tournament) filters.tournament = tournament;
    if (status) filters.registrationStatus = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    const registrations = await strapi.entityService.findMany('api::registration.registration', {
      filters,
      populate: ['tournament'],
      sort: ['createdAt:desc'],
      limit: 2000,
    });

    sendWorkbook(ctx, 'registrations.xlsx', 'Registrations', [
      { header: 'Tournament', key: 'tournament' },
      { header: 'Name', key: 'name' },
      { header: 'Phone', key: 'phone' },
      { header: 'Email', key: 'email' },
      { header: 'Role', key: 'role' },
      { header: 'Registration Status', key: 'registrationStatus' },
      { header: 'Payment Status', key: 'paymentStatus' },
      { header: 'Transaction ID', key: 'transactionId' },
      { header: 'Amount', key: 'amount' },
    ], registrations.map((item: any) => ({ ...item, tournament: item.tournament?.name || '-' })));
  },

  async paymentsExcel(ctx: any) {
    const { tournament, status, from, to } = ctx.query;
    const filters: any = {};
    if (tournament) filters.tournament = tournament;
    if (status) filters.status = status;
    if (from || to) filters.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };

    const payments = await strapi.entityService.findMany('api::payment.payment', {
      filters,
      populate: ['tournament', 'registration'],
      sort: ['createdAt:desc'],
      limit: 2000,
    });

    sendWorkbook(ctx, 'payments.xlsx', 'Payments', [
      { header: 'Tournament', key: 'tournament' },
      { header: 'Player', key: 'player' },
      { header: 'Method', key: 'method' },
      { header: 'Transaction ID', key: 'transactionId' },
      { header: 'Amount', key: 'amount' },
      { header: 'Status', key: 'status' },
      { header: 'Paid At', key: 'paidAt' },
    ], payments.map((item: any) => ({ ...item, tournament: item.tournament?.name || '-', player: item.registration?.name || '-' })));
  },
};
