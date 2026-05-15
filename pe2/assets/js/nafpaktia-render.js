/* ============================================================
   Ναυπακτία rendering: διαβάζει window.WB_DATA (inlined από
   nafpaktia-data.js). CORS-safe — δουλεύει και με file:// protocol.
   Signature feature: STEWARD Insider Critique direction (μοναδικό POST-D13).
   ============================================================ */

(function () {
  const data = window.WB_DATA;
  if (!data) { console.error('WB_DATA not loaded — include nafpaktia-data.js before nafpaktia-render.js'); return; }
  const C = window.WBCharts;
  if (!C) { console.error('WBCharts not loaded — include charts.js before nafpaktia-render.js'); return; }

  // ---------- Charts ----------
  // 13.1 Arrivals
  if (data.demand) {
    C.arrivals('chart_arrivals', {
      years: data.demand.years,
      foreign: data.demand.foreign_thousands,
      domestic: data.demand.domestic_thousands,
    });
  }

  // 13.2 Recovery index
  if (data.recovery) {
    C.recovery('chart_recovery', data.recovery);
  }

  // 13.3 Monthly arrivals
  if (data.monthly) {
    C.monthly('chart_monthly', data.monthly);
  }

  // 13.4 Gini
  if (data.seasonality) {
    C.gini('chart_gini', { years: data.seasonality.years, values: data.seasonality.gini });
  }

  // 13.5 Rooms by stars
  if (data.rooms_by_stars) {
    C.donut('chart_donut', data.rooms_by_stars);
  }

  // 13.6 Capacity dual-axis
  if (data.capacity) {
    C.capacity('chart_capacity', data.capacity);
  }

  // 13.7 Occupancy
  if (data.occupancy) {
    C.occupancy('chart_occupancy', data.occupancy);
  }

  // 13.8 ALoS
  if (data.demand) {
    C.alos('chart_alos', { years: data.demand.years, values: data.demand.alos });
  }

  // 13.9 STR share — split into 2 panels
  if (data.str_market) {
    C.strShare('chart_str_arrivals', data.str_market, 'str_arrival_share');
    C.strShare('chart_str_overnights', data.str_market, 'str_overnight_share');
  }

  // 13.10 POIs
  if (data.pois) {
    C.pois('chart_pois', data.pois);
  }

  // 13.11 IPA Quadrant
  C.ipa('chart_ipa', {
    x: [0.30, 0.26, 0.25, 0.16, 0.29, 0.20, 0.18, 0.31, 0.27, 0.21, 0.19, 0.24, 0.17, 0.22, 0.25],
    y: [4.00, 3.95, 3.85, 3.65, 3.85, 2.85, 3.10, 2.48, 3.42, 3.18, 3.45, 3.55, 3.21, 3.50, 3.65],
    labels: ['Καταλύματα (επάρκεια)','Καταλύματα (ποιότητα)','Χώροι εστίασης','Τουρ. υποδομές','Διασκέδαση','Τοπικό οδικό','Σύνδεση Ελλάδα','Στάθμευση','Ακτοπλοΐα','Δημ. Υγεία','Αστυνόμευση','Ύδρευση','Αποχέτευση','Απορρίμματα','Τηλεπ./Internet'],
    cat: ['Τουριστικές υποδομές','Τουριστικές υποδομές','Τουριστικές υποδομές','Τουριστικές υποδομές','Τουριστικές υποδομές','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες'],
  });

  // 13.12 Turnover
  if (data.str_market) {
    C.turnover('chart_turnover', {
      years: data.str_market.years,
      hotel: data.str_market.hotel_turnover_meur,
      str:   data.str_market.str_turnover_meur,
    });
  }

  // 13.13 GVA stacked
  if (data.economic) {
    C.gva('chart_gva', {
      years: data.economic.years,
      gi: data.economic.gva_gi_meur,
      other: data.economic.gva_total_meur.map((t, i) => t - data.economic.gva_gi_meur[i]),
    });
  }

  // 13.13b Quadrant Employment × SAT
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => v.Q15_pct);
    const ys = qd.map(([k,v]) => v.Q9_SAT_mean);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_employment', {
      x: xs, y: ys, labels, mature,
      xLabel: '% Τουριστικά απασχολούμενων στο νοικοκυριό',
      yLabel: 'Μέση συνολική ικανοποίηση κατοίκων (1–5)',
      xHigh: 'υψηλή εξάρτηση',  xLow: 'χαμηλή εξάρτηση',
      yHigh: 'περισσότερο ικανοποιημένοι', yLow: 'λιγότερο ικανοποιημένοι',
      labels_q: { tl: 'Διαφοροποιημένη / ικανοποιημένη', tr: 'Στηριζόμενη από τουρισμό', bl: 'Περιορισμένος τουρισμός / χαμηλή ικανοποίηση', br: 'Εξαρτώμενη / δυσαρεστημένη' },
    });
  }

  // 13.14 Permits
  if (data.permits) {
    C.permits('chart_permits', data.permits);
  }

  // 13.15 TII (NUTS3 series)
  if (data.demand) {
    C.tii('chart_tii', { years: data.demand.years, values: data.demand.tii_nuts3 });
  }

  // 13.15c Quadrant TFI × POI
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => Math.log10(Math.max(v.TFI_2024, 0.1)));
    const ys = qd.map(([k,v]) => v.POI_theta);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_tfi_poi', {
      x: xs, y: ys, labels, mature,
      xLabel: 'Δείκτης Τουριστικής Λειτουργίας TFI 2024 (log₁₀)',
      yLabel: 'Δείκτης Αντιληπτής Πίεσης POI θ',
      xHigh: 'μεγαλύτερη αντικειμενική πίεση', xLow: 'μικρότερη αντικειμενική πίεση',
      yHigh: 'υψηλότερη υποκειμενική πίεση', yLow: 'χαμηλότερη υποκειμενική πίεση',
      labels_q: { tl: 'Υποκειμενική κρίση από STR', tr: 'Κορεσμένος + ενήμερος', bl: 'Λανθάνον δυναμικό', br: 'Ώριμος προσαρμοσμένος' },
    });
  }

  // 13.16c Quadrant STR × Housing
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => v.Q3_7_pct);
    const ys = qd.map(([k,v]) => v.Q3_4_pct);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_str_housing', {
      x: xs, y: ys, labels, mature,
      xLabel: '% συμφωνώ: STR μειώνει διαθεσιμότητα κατοικιών',
      yLabel: '% συμφωνώ: υπάρχει πρόβλημα στέγης για μόνιμους',
      xHigh: 'μεγαλύτερη επίδραση STR', xLow: 'μικρότερη επίδραση STR',
      yHigh: 'εντονότερη στεγαστική κρίση', yLow: 'καμία στεγαστική κρίση',
      labels_q: { tl: 'Στεγ. πρόβλημα χωρίς STR ως αιτία', tr: 'Στεγαστική κρίση από STR', bl: 'Καμία πίεση', br: 'STR πίεση χωρίς στεγ. κρίση' },
    });
  }

  // 13.16 Doxey heatmap
  if (data.mrb_overall) {
    const labels = ['Ασφάλεια','Φιλικότητα','Στεγ. επίδραση','Ανταγωνισμός','Ευθύνη υποβάθμισης','Στήριξη μέτρων'];
    const dests = ['Ναυπακτία','Κέρκυρα','Χανιά','Μύκονος','Βόλος-Πήλιο','Ναύπλιο'];
    C.heatmap('chart_doxey', {
      rows: labels,
      cols: dests,
      z: [
        [4.56, 4.50, 4.31, 4.28, 4.49, 4.49],
        [4.18, 4.00, 4.15, 4.19, 4.11, 4.17],
        [3.05, 3.39, 3.05, 2.71, 2.33, 2.47],
        [2.62, 3.35, 3.12, 2.82, 2.31, 2.47],
        [1.95, 2.15, 2.38, 2.34, 1.90, 1.89],
        [2.18, 2.65, 2.61, 2.74, 2.11, 1.82],
      ],
      cbarTitle: 'Μέση αξιολόγηση (1–5)',
      zmin: 1, zmax: 5,
    });
  }

  // 13.17 LCA
  if (data.lca) {
    const dest_pretty = data.lca.destinations.map(prettify);
    C.lca('chart_lca', { dests: dest_pretty, classes: data.lca.classes, values: data.lca.values });
  }

  // 13.17b Quadrant LCA polarization
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => v.PCT_C1_antagonism);
    const ys = qd.map(([k,v]) => v.PCT_C5_pure_euphoria);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_lca', {
      x: xs, y: ys, labels, mature,
      xLabel: '% LCA Class 1: Δυσαρεστημένοι (αντιπαλότητα)',
      yLabel: '% LCA Class 5: Ένθερμοι (καθαρή ευφορία)',
      xHigh: 'περισσότεροι αντίπαλοι', xLow: 'λιγότεροι αντίπαλοι',
      yHigh: 'περισσότεροι ένθερμοι', yLow: 'λιγότεροι ένθερμοι',
      labels_q: { tl: 'Υγιής συναίνεση', tr: 'Πολωμένη κοινωνία', bl: 'Απάθεια / αποστασιοποίηση', br: 'Σύγκρουση κυρίαρχη' },
    });
  }

  // 13.18 Environmental heatmap (Q3 + Q7 cross-dest)
  if (data.mrb_cross) {
    const q3 = data.mrb_cross.Q3;
    const q7 = data.mrb_cross.Q7;
    const labels = ['Ηχορύπανση','Απορρίμματα','Πίεση οικοσυστημάτων','Ποιότητα υδάτων','Αρχιτεκτ. αλλοίωση','Αύξηση τιμών','STR/Airbnb επίδραση','Στεγαστική κρίση'];
    const dest_pretty = ['Ναυπακτία','Κέρκυρα','Χανιά','Μύκονος','Βόλος-Πήλιο','Ναύπλιο'];
    const idx = ['Q7_1','Q7_2','Q7_3','Q7_4','Q7_5','Q3_3','Q3_4','Q3_5'];
    const dest_codes = ['ΝΑΥΠΑΚΤΙΑ','ΚΕΡΚΥΡΑ','ΧΑΝΙΑ','ΜΥΚΟΝΟΣ','ΒΟΛΟΣ_ΠΗΛΙΟ','ΝΑΥΠΛΙΟ'];
    const z = idx.map(it => {
      const block = it.startsWith('Q3') ? q3 : q7;
      const i = block.items.indexOf(it);
      if (i < 0) return dest_codes.map(_ => null);
      return dest_codes.map(d => {
        const j = block.destinations.indexOf(d);
        return j >= 0 ? block.values[i][j] : null;
      });
    });
    C.heatmap('chart_env_heat', {
      rows: labels, cols: dest_pretty, z,
      scale: [
        [0,'#fff8e8'],[0.2,'#fde0a4'],[0.4,'#f9b774'],
        [0.6,'#ed7d56'],[0.8,'#cc4a3c'],[1,'#8b1a1f']
      ],
      cbarTitle: '% συμφωνώ', zmin: 0, zmax: 100,
    });
  }

  // 13.19 Land cover
  if (data.land_cover) {
    C.landCover('chart_landcover', {
      labels: data.land_cover.categories_2022.map(c => c.label),
      values: data.land_cover.categories_2022.map(c => c.km2),
    });
  }

  // 13.20 WEI+
  if (data.water_exploitation) {
    C.wei('chart_wei', data.water_exploitation);
  }

  // ---------- SWOT ----------
  if (data.swot) {
    const grid = document.getElementById('swot_grid');
    if (grid) {
      const cells = [
        { key: 'S', label: 'Δυνάμεις', items: data.swot.S },
        { key: 'W', label: 'Αδυναμίες', items: data.swot.W },
        { key: 'O', label: 'Ευκαιρίες', items: data.swot.O },
        { key: 'T', label: 'Απειλές', items: data.swot.T },
      ];
      grid.innerHTML = cells.map(c => `
        <div class="swot-cell ${c.key.toLowerCase()}">
          <p class="swot-label">${c.label}</p>
          <ul class="space-y-2 text-sm">
            ${c.items.map(it => `<li><strong class="text-navy-700">${escapeHtml(it.title)}</strong><br><span class="text-ink-500 text-[12px]">${escapeHtml(it.details)}</span></li>`).join('')}
          </ul>
        </div>
      `).join('');
    }
  }

  // ---------- Strategic axes ----------
  if (data.strategic_axes) {
    const grid = document.getElementById('axes_grid');
    if (grid) {
      grid.innerHTML = data.strategic_axes.map(a => `
        <div class="axis-card">
          <span class="axis-num">0${a.num}</span>
          <h4 class="axis-title">${escapeHtml(a.title)}</h4>
          <p class="text-sm text-ink-700 leading-relaxed">${escapeHtml(a.body.slice(0, 300))}…</p>
        </div>
      `).join('');
    }
  }

  // ---------- 7 Proposals ----------
  if (data.proposals) {
    const list = document.getElementById('proposals_list');
    if (list) {
      list.innerHTML = data.proposals.map(p => `
        <details class="border border-[var(--rule)] bg-white">
          <summary class="px-5 py-4 cursor-pointer hover:bg-navy-50 transition-colors">
            <span class="section-marker mr-3">Πρόταση 0${p.num}</span>
            <span class="font-serif text-lg text-navy-700">${escapeHtml(p.title)}</span>
          </summary>
          <div class="px-5 pb-5 pt-2 text-sm text-ink-700 leading-relaxed border-t border-[var(--rule)]">
            ${escapeHtml(p.body)}
          </div>
        </details>
      `).join('');
    }
  }

  // ---------- Quotes carousel ----------
  if (data.quotes && data.quotes.length) {
    const rail = document.getElementById('quotes_rail');
    if (rail) {
      rail.innerHTML = data.quotes.map(q => `
        <div class="quote-card">
          <p class="pullquote">${escapeHtml(q.text)}</p>
          <p class="pullquote-attr">${escapeHtml(q.attr)}</p>
        </div>
      `).join('');
    }
  }

  // ---------- Insider Critique 8-metric table (Ναυπακτία signature: STEWARD direction) ----------
  if (data.insider_critique) {
    const wrap = document.getElementById('insider_critique_table');
    if (wrap) {
      const ic = data.insider_critique;
      const rows = ic.items.map(it => `
        <tr>
          <td><code class="text-xs">${escapeHtml(it.code)}</code></td>
          <td>${escapeHtml(it.label)}</td>
          <td class="num">${it.erg_pct.toFixed(2)}</td>
          <td class="num">${it.der_pct.toFixed(2)}</td>
          <td class="num"><strong>${(it.dpp >= 0 ? '+' : '−')}${Math.abs(it.dpp).toFixed(2)}</strong></td>
          <td class="text-xs">${escapeHtml(it.signal)}</td>
        </tr>
      `).join('');
      const footer = `
        <tr class="border-t-2 border-accent-500 bg-accent-300/10">
          <td colspan="4"><strong>Συνολική κατεύθυνση</strong></td>
          <td class="num"><strong>+${ic.summary.mean_dpp_abs.toFixed(2)} avg |Δpp|</strong></td>
          <td><strong>${escapeHtml(ic.summary.classification)}</strong> (n_sig = ${ic.summary.n_sig_total})</td>
        </tr>`;
      wrap.innerHTML = rows + footer;
    }
  }

  // ---------- Primary survey raw table (all 64 items) ----------
  if (data.mrb_overall) {
    const tbody = document.querySelector('#mrb_table tbody');
    if (tbody) {
      const rows = Object.entries(data.mrb_overall).map(([k, v]) => {
        const meanStr = (v.mean == null) ? '—' : v.mean.toFixed(2);
        const pctStr = (v.pct_agree == null) ? '—' : `${v.pct_agree.toFixed(1)}%`;
        return `<tr><td><code class="text-xs">${k}</code></td><td class="num">${meanStr}</td><td class="num">${pctStr}</td><td class="num">${v.n_valid}</td></tr>`;
      }).join('');
      tbody.innerHTML = rows;
    }
  }

  // ---------- Methodological boxes (data annex) ----------
  if (data.methodological_boxes) {
    const cont = document.getElementById('method_boxes');
    if (cont) {
      cont.innerHTML = data.methodological_boxes.map(b => `
        <div class="method-box">
          <p class="method-box-title">${escapeHtml(b.title)}</p>
          <p class="method-box-content">${escapeHtml(b.body)}</p>
        </div>
      `).join('');
    }
  }

  // ---------- Sources list ----------
  if (data.meta && data.meta.sources) {
    const list = document.getElementById('sources_list');
    if (list) list.innerHTML = data.meta.sources.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }


  // ---------- Helpers ----------
  function prettify(code) {
    const map = {
      'ΚΕΡΚΥΡΑ':'Κέρκυρα','ΧΑΝΙΑ':'Χανιά','ΜΥΚΟΝΟΣ':'Μύκονος',
      'ΒΟΛΟΣ_ΠΗΛΙΟ':'Βόλος-Πήλιο','ΝΑΥΠΛΙΟ':'Ναύπλιο',
      'ΙΩΑΝΝΙΝΑ':'Ιωάννινα','ΚΑΣΤΟΡΙΑ':'Καστοριά',
      'ΑΛΕΞΑΝΔΡΟΥΠΟΛΗ_ΣΑΜΟΘΡΑΚΗ':'Αλεξ./πολη',
      'ΤΡΟΙΖΗΝΙΑ_ΜΕΘΑΝΑ':'Τροιζηνία','ΝΑΥΠΑΚΤΙΑ':'Ναυπακτία',
    };
    return map[code] || code;
  }
  function isMature(code) {
    return ['ΚΕΡΚΥΡΑ','ΧΑΝΙΑ','ΜΥΚΟΝΟΣ','ΒΟΛΟΣ_ΠΗΛΙΟ','ΝΑΥΠΛΙΟ'].includes(code);
  }
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }
})();
