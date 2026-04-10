// ============================================================
//  Vercel Serverless Function — Envio de E-mails via Brevo
//  Rota: POST /api/send-email
// ============================================================

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

// ── Helpers ─────────────────────────────────────────────────

function moeda(v) {
  return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function pct(v) {
  return Number(v || 0).toFixed(1) + '%';
}

function corScore(score) {
  if (score >= 75) return '#1DB87A';
  if (score >= 55) return '#85C83E';
  if (score >= 35) return '#E8A020';
  return '#C0392B';
}

function labelScore(score) {
  if (score >= 75) return 'Saudável';
  if (score >= 55) return 'Razoável';
  if (score >= 35) return 'Atenção';
  return 'Crítico';
}

// ── Template e-mail para o CLIENTE ──────────────────────────

function htmlCliente(d, cfg) {
  const cor = corScore(d.score);
  const lbl = labelScore(d.score);

  const passos = (d.proximosPassos || [])
    .map((p, i) => `
      <tr>
        <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0;">
          <span style="display:inline-block;width:24px;height:24px;border-radius:50%;
            background:#0A7B5C;color:#fff;text-align:center;line-height:24px;
            font-size:12px;font-weight:700;margin-right:10px;">${i + 1}</span>
          ${p}
        </td>
      </tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Diagnóstico Financeiro</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:#0A1F14;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 4px;font-size:22px;font-weight:700;">${cfg.nomeEmpresa}</h1>
    <p style="color:rgba(255,255,255,.6);margin:0;font-size:13px;">Diagnóstico Financeiro Empresarial</p>
  </td></tr>

  <!-- SCORE -->
  <tr><td style="background:#0F2D1C;padding:28px 40px;text-align:center;">
    <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Índice de Saúde Financeira</p>
    <div style="display:inline-block;background:${cor};border-radius:50%;width:80px;height:80px;
      line-height:80px;font-size:32px;font-weight:800;color:#fff;">${d.score}</div>
    <p style="color:${cor};font-size:16px;font-weight:700;margin:12px 0 0;">${lbl}</p>
  </td></tr>

  <!-- CORPO -->
  <tr><td style="background:#fff;padding:36px 40px;">

    <p style="color:#1a1a1a;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Olá, <strong>${d.nomeContato || 'empresário(a)'}</strong>! Segue abaixo o resultado completo
      do seu diagnóstico financeiro empresarial. Analisamos os principais indicadores do seu negócio
      e preparamos recomendações personalizadas para você.
    </p>

    <!-- KPIs -->
    <h2 style="color:#0A1F14;font-size:15px;font-weight:700;border-left:4px solid #0A7B5C;
      padding-left:12px;margin:0 0 16px;">Resumo dos Indicadores</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="50%" style="padding:0 8px 12px 0;">
          <div style="background:#f8f9fa;border-radius:8px;padding:16px;">
            <div style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.5px;">Faturamento Mensal</div>
            <div style="color:#0A1F14;font-size:18px;font-weight:700;margin-top:4px;">${moeda(d.faturamento)}</div>
          </div>
        </td>
        <td width="50%" style="padding:0 0 12px 8px;">
          <div style="background:#f8f9fa;border-radius:8px;padding:16px;">
            <div style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.5px;">Resultado Mensal</div>
            <div style="color:${d.lucro >= 0 ? '#0A7B5C' : '#C0392B'};font-size:18px;font-weight:700;margin-top:4px;">${moeda(d.lucro)}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:0 8px 12px 0;">
          <div style="background:#f8f9fa;border-radius:8px;padding:16px;">
            <div style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.5px;">Passivo Total</div>
            <div style="color:#C0392B;font-size:18px;font-weight:700;margin-top:4px;">${moeda(d.passivoTotal)}</div>
          </div>
        </td>
        <td width="50%" style="padding:0 0 12px 8px;">
          <div style="background:#f8f9fa;border-radius:8px;padding:16px;">
            <div style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.5px;">Margem de Lucro</div>
            <div style="color:#0A1F14;font-size:18px;font-weight:700;margin-top:4px;">${pct(d.margem)}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- PRÓXIMOS PASSOS -->
    ${passos ? `
    <h2 style="color:#0A1F14;font-size:15px;font-weight:700;border-left:4px solid #0A7B5C;
      padding-left:12px;margin:0 0 16px;">Próximos Passos Recomendados</h2>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid #e8e8e8;border-radius:8px;margin-bottom:28px;overflow:hidden;">
      ${passos}
    </table>` : ''}

    <!-- CTA -->
    <div style="background:linear-gradient(135deg,#0A1F14,#0A7B5C);border-radius:12px;
      padding:28px;text-align:center;margin-bottom:24px;">
      <p style="color:#fff;font-size:16px;font-weight:700;margin:0 0 8px;">
        Pronto para transformar esses números?
      </p>
      <p style="color:rgba(255,255,255,.8);font-size:13px;margin:0 0 20px;line-height:1.6;">
        Nossos especialistas estão prontos para criar um plano de ação personalizado
        para a realidade do seu negócio. Agende agora uma consulta gratuita.
      </p>
      <a href="https://wa.me/${cfg.whatsapp}?text=Olá!%20Recebi%20meu%20diagnóstico%20financeiro%20e%20gostaria%20de%20agendar%20uma%20consulta."
        style="display:inline-block;background:#25D366;color:#fff;font-size:14px;font-weight:700;
        padding:14px 32px;border-radius:8px;text-decoration:none;">
        📅 Agendar Consulta Gratuita
      </a>
    </div>

    <p style="color:#999;font-size:12px;text-align:center;margin:0;">
      Este relatório foi gerado automaticamente por ${cfg.nomeEmpresa}.<br>
      Em caso de dúvidas, entre em contato conosco.
    </p>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0A1F14;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
    <p style="color:rgba(255,255,255,.5);font-size:12px;margin:0;">${cfg.nomeEmpresa} — Diagnóstico Financeiro</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

// ── Template e-mail para a EMPRESA ──────────────────────────

function htmlEmpresa(d, cfg) {
  const cor = corScore(d.score);
  const lbl = labelScore(d.score);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Novo Lead</title></head>
<body style="margin:0;padding:24px;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

  <tr><td style="background:#0A1F14;padding:24px 32px;">
    <h2 style="color:#fff;margin:0;font-size:18px;">🔔 Novo Lead — Diagnóstico Financeiro</h2>
  </td></tr>

  <tr><td style="padding:28px 32px;">

    <h3 style="color:#0A1F14;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">Dados do Contato</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;margin-bottom:24px;">
      <tr><td style="padding:6px 0;color:#999;width:140px;">Nome</td><td><strong>${d.nomeContato || '—'}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#999;">E-mail</td><td><a href="mailto:${d.emailCliente}" style="color:#0A7B5C;">${d.emailCliente}</a></td></tr>
      <tr><td style="padding:6px 0;color:#999;">Telefone</td><td>${d.telefone || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#999;">Empresa</td><td>${d.nomeEmpresa || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#999;">Segmento</td><td>${d.segmento || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#999;">Regime</td><td>${d.regime || '—'}</td></tr>
    </table>

    <h3 style="color:#0A1F14;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">Resultado do Diagnóstico</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;color:#999;width:140px;">Índice de Saúde</td>
        <td><strong style="color:${cor};">${d.score}/100 — ${lbl}</strong></td>
      </tr>
      <tr><td style="padding:6px 0;color:#999;">Faturamento</td><td>${moeda(d.faturamento)}/mês</td></tr>
      <tr><td style="padding:6px 0;color:#999;">Resultado</td><td>${moeda(d.lucro)}/mês</td></tr>
      <tr><td style="padding:6px 0;color:#999;">Margem</td><td>${pct(d.margem)}</td></tr>
      <tr><td style="padding:6px 0;color:#999;">Passivo Total</td><td>${moeda(d.passivoTotal)}</td></tr>
      <tr><td style="padding:6px 0;color:#999;">Endividamento</td><td>${pct(d.endividPct)} do passivo</td></tr>
    </table>

    <a href="https://wa.me/${cfg.whatsapp}?text=Olá%20${encodeURIComponent(d.nomeContato || 'cliente')},%20vi%20seu%20diagnóstico%20e%20gostaria%20de%20conversar!"
      style="display:inline-block;background:#25D366;color:#fff;font-size:14px;font-weight:700;
      padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">
      💬 Entrar em contato via WhatsApp
    </a>

  </td></tr>

  <tr><td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e0e0e0;">
    <p style="color:#999;font-size:12px;margin:0;">Gerado em ${new Date().toLocaleString('pt-BR')} — Sistema de Diagnóstico Financeiro</p>
  </td></tr>

</table>
</body></html>`;
}

// ── Enviar via Brevo ─────────────────────────────────────────

async function enviarEmail({ to, toName, subject, html, remetente }) {
  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: remetente.nome, email: remetente.email },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`Brevo error ${res.status}: ${erro}`);
  }
  return res.json();
}

// ── Handler principal ────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  try {
    const d = req.body;

    const cfg = {
      nomeEmpresa: process.env.NOME_EMPRESA || 'Consultoria Financeira',
      emailEmpresa: process.env.EMAIL_EMPRESA,
      whatsapp: process.env.WHATSAPP,
    };

    if (!cfg.emailEmpresa || !process.env.BREVO_API_KEY) {
      return res.status(500).json({ erro: 'Configuração incompleta no servidor.' });
    }

    const remetente = { nome: cfg.nomeEmpresa, email: cfg.emailEmpresa };

    // 1️⃣ E-mail para o CLIENTE
    await enviarEmail({
      to: d.emailCliente,
      toName: d.nomeContato,
      subject: `Seu Diagnóstico Financeiro — ${cfg.nomeEmpresa}`,
      html: htmlCliente(d, cfg),
      remetente,
    });

    // 2️⃣ E-mail para a EMPRESA
    await enviarEmail({
      to: cfg.emailEmpresa,
      toName: cfg.nomeEmpresa,
      subject: `🔔 Novo Lead: ${d.nomeContato || d.emailCliente} (Score ${d.score})`,
      html: htmlEmpresa(d, cfg),
      remetente,
    });

    return res.status(200).json({ ok: true, mensagem: 'E-mails enviados com sucesso.' });

  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    return res.status(500).json({ erro: err.message });
  }
}
