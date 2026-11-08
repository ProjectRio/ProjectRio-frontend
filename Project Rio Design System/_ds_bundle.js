/* @ds-bundle: {"format":3,"namespace":"ProjectRioDesignSystem_6fbb66","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Select","sourcePath":"components/core/Input.jsx"},{"name":"LiveDot","sourcePath":"components/core/LiveDot.jsx"},{"name":"LiveLabel","sourcePath":"components/core/LiveDot.jsx"},{"name":"Panel","sourcePath":"components/core/Panel.jsx"},{"name":"PanelHeader","sourcePath":"components/core/Panel.jsx"},{"name":"TierBadge","sourcePath":"components/core/TierBadge.jsx"},{"name":"GameScoreCard","sourcePath":"components/data/GameScoreCard.jsx"},{"name":"LadderTable","sourcePath":"components/data/LadderTable.jsx"},{"name":"PageHeader","sourcePath":"components/data/PageHeader.jsx"},{"name":"StatTable","sourcePath":"components/data/StatTable.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"0efced3e7dd7","components/core/Badge.jsx":"5445fc6a3070","components/core/Button.jsx":"f2d86bd2005f","components/core/Input.jsx":"532b0fb94b6f","components/core/LiveDot.jsx":"7e9ad474e7ef","components/core/Panel.jsx":"22ac03bffc76","components/core/TierBadge.jsx":"8d520b61413b","components/data/GameScoreCard.jsx":"4d258c128103","components/data/LadderTable.jsx":"08707fd340e0","components/data/PageHeader.jsx":"26fe88e0babd","components/data/StatTable.jsx":"7add7e457305","ui_kits/web/app.jsx":"4aa1573b665f"},"inlinedExternals":[],"unexposedExports":[{"name":"ratingToTier","sourcePath":"components/core/TierBadge.jsx"}]} */

(() => {

const __ds_ns = (window.ProjectRioDesignSystem_6fbb66 = window.ProjectRioDesignSystem_6fbb66 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Player avatar — initials on Rio red, or a character sprite image.
 */
function Avatar({
  name = '',
  src = null,
  size = 36,
  style = {},
  ...props
}) {
  const initials = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: 'var(--rio-500)',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.4,
      textTransform: 'uppercase',
      flexShrink: 0,
      ...style
    }
  }, props), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      imageRendering: 'pixelated'
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Small uppercase status pill. Matches the app's Badge color set.
 */
function Badge({
  color = 'red',
  children,
  className = '',
  style = {},
  ...props
}) {
  const colors = {
    red: {
      bg: 'rgb(230 0 18 / 0.15)',
      fg: 'var(--rio-300)',
      bd: 'rgb(230 0 18 / 0.4)'
    },
    gold: {
      bg: 'rgb(245 187 0 / 0.15)',
      fg: 'var(--star-400)',
      bd: 'rgb(245 187 0 / 0.4)'
    },
    gray: {
      bg: 'rgb(43 43 64 / 0.5)',
      fg: 'var(--fog-300)',
      bd: 'var(--night-600)'
    },
    green: {
      bg: 'rgb(16 185 129 / 0.15)',
      fg: 'var(--emerald-300)',
      bd: 'rgb(16 185 129 / 0.4)'
    }
  };
  const c = colors[color] || colors.red;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${c.bd}`,
      background: c.bg,
      color: c.fg,
      padding: '0.125rem 0.5rem',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Project Rio button — angled clip-path, uppercase Rajdhani.
 * Primary = solid Rio red; secondary = outlined ghost.
 */
function Button({
  variant = 'primary',
  size = 'md',
  icon = null,
  as = 'button',
  className = '',
  children,
  ...props
}) {
  const sizes = {
    sm: {
      padding: '0.4rem 1rem',
      fontSize: '0.8125rem'
    },
    md: {
      padding: '0.625rem 1.5rem',
      fontSize: '0.875rem'
    },
    lg: {
      padding: '0.8rem 2rem',
      fontSize: '1rem'
    }
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: `${variant === 'secondary' ? 'btn-secondary' : 'btn-primary'} ${className}`,
    style: sizes[size] || sizes.md
  }, props), icon && /*#__PURE__*/React.createElement("img", {
    src: icon,
    alt: "",
    "aria-hidden": "true",
    style: {
      width: '1.1em',
      height: '1.1em',
      objectFit: 'contain',
      imageRendering: 'pixelated'
    }
  }), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Labeled text input matching the Rio form vocabulary. */
function Input({
  label,
  id,
  className = '',
  style = {},
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "label",
    htmlFor: id
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    className: `input ${className}`,
    style: style
  }, props)));
}

/** Native select styled to match Input. */
function Select({
  label,
  id,
  className = '',
  children,
  style = {},
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "label",
    htmlFor: id
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    className: `input ${className}`,
    style: style
  }, props), children));
}
Object.assign(__ds_scope, { Input, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/LiveDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Pulsing red "live" indicator dot. */
function LiveDot({
  size = 10,
  style = {},
  ...props
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: size,
      height: size,
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      display: 'inline-flex',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundColor: 'var(--rio-400)',
      opacity: 0.75,
      animation: 'rio-ping 1s cubic-bezier(0,0,0.2,1) infinite'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: 'var(--rio-500)'
    }
  }));
}

/** Inline "LIVE — Top 5" style label with a pulsing dot. */
function LiveLabel({
  children = 'Live',
  style = {},
  ...props
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--rio-400)',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement(LiveDot, null), children);
}
Object.assign(__ds_scope, { LiveDot, LiveLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/LiveDot.jsx", error: String((e && e.message) || e) }); }

// components/core/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Standard dark card surface. Use `glow` for the red hover bloom. */
function Panel({
  glow = false,
  className = '',
  style = {},
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `panel ${glow ? 'panel-glow' : ''} ${className}`,
    style: style
  }, props), children);
}

/** Uppercase header bar for a Panel, with an optional right-aligned action. */
function PanelHeader({
  title,
  action = null,
  className = '',
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `panel-header ${className}`
  }, props), /*#__PURE__*/React.createElement("span", null, title), action);
}
Object.assign(__ds_scope, { Panel, PanelHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Panel.jsx", error: String((e && e.message) || e) }); }

// components/core/TierBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TIERS = ['Shell', 'Mushroom', 'Flower', 'Star', 'Special', 'Legend'];
const DIVISIONS = ['V', 'IV', 'III', 'II', 'I'];
const ROMAN = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5
};
const TIER_COLORS = {
  Shell: ['#8bbf8c', '#a4cca5', '#bbdfba', '#d7ecd1', '#e6f0e1'],
  Mushroom: ['#ff4949', '#ff5a5a', '#f97979', '#ff8989', '#ffa9a9'],
  Flower: ['#ff6700', '#fb7216', '#ff8532', '#fd8f45', '#ffa162'],
  Star: ['#fff25c', '#fff476', '#fff68f', '#fff8a9', '#fffac2'],
  Special: ['#775587', '#8c679c', '#9d7bae', '#bf9ece', '#e0c5f0'],
  Legend: ['#af9146', '#c5a34f', '#dbb658', '#debd68', '#e2c479']
};

/** Map an ELO rating to its tier label, e.g. 1240 -> "Flower III". */
function ratingToTier(rating) {
  if (rating < 600) return 'Shell V';
  if (rating >= 2000) return 'Legend I';
  const step = Math.floor((rating - 600) / 50) + 1;
  return `${TIERS[Math.floor(step / 5)]} ${DIVISIONS[step % 5]}`;
}
function tierColor(label) {
  const [name, div] = label.split(' ');
  return (TIER_COLORS[name] || TIER_COLORS.Shell)[(ROMAN[div] ?? 1) - 1];
}

/**
 * Ranked-tier chip. Pass either a `tier` label ("Star II") or a numeric
 * `rating` (mapped via ratingToTier). Colored to the ladder palette.
 */
function TierBadge({
  tier,
  rating,
  className = '',
  style = {},
  ...props
}) {
  const label = tier ?? ratingToTier(rating ?? 0);
  const color = tierColor(label);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-block',
      borderRadius: 'var(--radius-sm)',
      padding: '0.125rem 0.5rem',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      backgroundColor: `${color}22`,
      color,
      border: `1px solid ${color}55`,
      ...style
    }
  }, props), label);
}
Object.assign(__ds_scope, { ratingToTier, TierBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TierBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/GameScoreCard.jsx
try { (() => {
function TeamRow({
  team,
  won
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.625rem 1rem'
    }
  }, team.sprite && /*#__PURE__*/React.createElement("img", {
    src: team.sprite,
    alt: "",
    style: {
      height: 40,
      width: 40,
      objectFit: 'contain',
      imageRendering: 'pixelated'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: won ? 'var(--fog-100)' : 'var(--fog-500)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, team.user), team.elo != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--fog-500)'
    }
  }, "ELO ", team.elo.before, " \u2192", ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      color: won ? 'var(--emerald-400)' : 'var(--rio-400)'
    }
  }, team.elo.after))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      color: won ? 'var(--fog-100)' : 'var(--fog-500)'
    }
  }, team.score));
}

/**
 * Final-score card for a completed game. `away`/`home` carry the user,
 * score, optional team sprite, and ELO {before, after}.
 */
function GameScoreCard({
  away,
  home,
  status = 'Final',
  timeAgo,
  mode,
  stadium,
  onBoxScore
}) {
  const homeWon = home.score > away.score;
  return /*#__PURE__*/React.createElement("div", {
    className: "panel panel-glow"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1rem',
      borderBottom: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--fog-500)'
    }
  }, status), timeAgo && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--fog-500)'
    }
  }, timeAgo)), /*#__PURE__*/React.createElement(TeamRow, {
    team: away,
    won: !homeWon
  }), /*#__PURE__*/React.createElement(TeamRow, {
    team: home,
    won: homeWon
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1rem',
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }, mode && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    color: "gray"
  }, mode), stadium && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--fog-500)'
    }
  }, stadium)), onBoxScore && /*#__PURE__*/React.createElement("button", {
    onClick: onBoxScore,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--rio-400)'
    }
  }, "Box Score \u2192")));
}
Object.assign(__ds_scope, { GameScoreCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/GameScoreCard.jsx", error: String((e && e.message) || e) }); }

// components/data/LadderTable.jsx
try { (() => {
/**
 * Ranked ladder leaderboard. Each row: { username, rating, wins, losses }.
 * Renders rank, tier chip, player, rating, W–L, and win %.
 */
function LadderTable({
  rows,
  highlightUser
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "stat-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "#"), /*#__PURE__*/React.createElement("th", null, "Tier"), /*#__PURE__*/React.createElement("th", null, "Player"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "Rating"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "W\u2013L"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "Win %"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, i) => {
    const total = row.wins + row.losses;
    const pct = total ? (row.wins / total * 100).toFixed(1) : '0.0';
    const featured = highlightUser && row.username === highlightUser;
    return /*#__PURE__*/React.createElement("tr", {
      key: row.username,
      style: featured ? {
        background: 'var(--surface-raised)'
      } : undefined
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        color: 'var(--fog-500)'
      }
    }, i + 1), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(__ds_scope.TierBadge, {
      rating: row.rating
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        fontWeight: 500,
        color: featured ? 'var(--star-400)' : 'var(--fog-100)'
      }
    }, row.username), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--fog-100)'
      }
    }, row.rating), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums'
      }
    }, row.wins, "\u2013", row.losses), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums'
      }
    }, pct, "%"));
  }))));
}
Object.assign(__ds_scope, { LadderTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/LadderTable.jsx", error: String((e && e.message) || e) }); }

// components/data/PageHeader.jsx
try { (() => {
/** Page title block — uppercase Rajdhani title with optional kicker + actions. */
function PageHeader({
  kicker,
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-8)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", null, kicker && /*#__PURE__*/React.createElement("p", {
    className: "kicker"
  }, kicker), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: '0.25rem',
      fontSize: 'var(--text-4xl)',
      textTransform: 'uppercase'
    }
  }, title)), children && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, children));
}
Object.assign(__ds_scope, { PageHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PageHeader.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTable.jsx
try { (() => {
/**
 * Generic Rio stat table. `columns` describe headers + cell accessors;
 * `rows` are arbitrary records. First column is left-aligned (the label),
 * the rest render tabular-nums. Use `highlightKey` to flag a featured row.
 */
function StatTable({
  columns,
  rows,
  highlightKey,
  rowKey = 'id'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "stat-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(col => /*#__PURE__*/React.createElement("th", {
    key: col.key,
    style: col.align === 'right' ? {
      textAlign: 'right'
    } : undefined
  }, col.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, i) => {
    const highlighted = highlightKey != null && row[rowKey] === highlightKey;
    return /*#__PURE__*/React.createElement("tr", {
      key: row[rowKey] ?? i,
      style: highlighted ? {
        background: 'var(--surface-raised)'
      } : undefined
    }, columns.map((col, c) => {
      const raw = col.render ? col.render(row, i) : row[col.key];
      const numeric = c > 0 && col.align !== 'left';
      return /*#__PURE__*/React.createElement("td", {
        key: col.key,
        style: {
          textAlign: col.align === 'right' || numeric ? 'right' : 'left',
          fontVariantNumeric: numeric ? 'tabular-nums' : undefined,
          color: highlighted && c === 0 ? 'var(--star-400)' : undefined,
          fontWeight: c === 0 ? 600 : undefined
        }
      }, raw);
    }));
  }))));
}
Object.assign(__ds_scope, { StatTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTable.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/app.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Project Rio — Web UI kit. Interactive recreation of the live site,
   composing the design-system primitives from the compiled bundle. */
const {
  useState
} = React;
const NS = window.ProjectRioDesignSystem_6fbb66;
const {
  Button,
  Badge,
  TierBadge,
  Input,
  Select,
  Avatar,
  LiveLabel,
  LiveDot,
  Panel,
  PanelHeader,
  PageHeader,
  LadderTable,
  StatTable,
  GameScoreCard
} = NS;
const A = '../../assets';
const sprite = n => `${A}/characters/${n}.png`;

/* ----------------------------- data ----------------------------- */
const GAMES = [{
  status: 'Final',
  timeAgo: '4m ago',
  mode: 'Big Balls Brawl',
  stadium: 'Mario Stadium',
  away: {
    user: 'DingerCity',
    score: 9,
    sprite: sprite('Mario'),
    elo: {
      before: 1980,
      after: 1998
    }
  },
  home: {
    user: 'JoeBaseball',
    score: 4,
    sprite: sprite('Bowser'),
    elo: {
      before: 1876,
      after: 1858
    }
  }
}, {
  status: 'Final / 7',
  timeAgo: '22m ago',
  mode: 'Standard',
  stadium: 'Bowser Castle',
  away: {
    user: 'Roeming',
    score: 2,
    sprite: sprite('Peach'),
    elo: {
      before: 1542,
      after: 1527
    }
  },
  home: {
    user: 'NokiMain',
    score: 11,
    sprite: sprite('DK'),
    elo: {
      before: 1180,
      after: 1205
    }
  }
}, {
  status: 'Final',
  timeAgo: '1h ago',
  mode: 'Star Mode',
  stadium: 'Peach Garden',
  away: {
    user: 'ShyGuyGod',
    score: 6,
    sprite: sprite('Yoshi'),
    elo: {
      before: 1410,
      after: 1426
    }
  },
  home: {
    user: 'WarioWare',
    score: 5,
    sprite: sprite('Wario'),
    elo: {
      before: 1455,
      after: 1439
    }
  }
}, {
  status: 'Final',
  timeAgo: '2h ago',
  mode: 'Big Balls Brawl',
  stadium: 'Yoshi Park',
  away: {
    user: 'BabyBomber',
    score: 3,
    sprite: sprite('Daisy'),
    elo: {
      before: 1290,
      after: 1276
    }
  },
  home: {
    user: 'KingOfBoos',
    score: 8,
    sprite: sprite('King Boo'),
    elo: {
      before: 1620,
      after: 1638
    }
  }
}, {
  status: 'Final / 9',
  timeAgo: '3h ago',
  mode: 'Standard',
  stadium: 'DK Jungle',
  away: {
    user: 'DiddyDinger',
    score: 7,
    sprite: sprite('Diddy'),
    elo: {
      before: 1335,
      after: 1351
    }
  },
  home: {
    user: 'GhostRunner',
    score: 6,
    sprite: sprite('Boo'),
    elo: {
      before: 1500,
      after: 1484
    }
  }
}, {
  status: 'Final',
  timeAgo: '5h ago',
  mode: 'Star Mode',
  stadium: 'Wario Palace',
  away: {
    user: 'JuniorVarsity',
    score: 1,
    sprite: sprite('Bowser Jr'),
    elo: {
      before: 1120,
      after: 1108
    }
  },
  home: {
    user: 'PlumberMain',
    score: 4,
    sprite: sprite('Luigi'),
    elo: {
      before: 1205,
      after: 1219
    }
  }
}];
const LADDER = [{
  username: 'DingerCity',
  rating: 2014,
  wins: 142,
  losses: 38
}, {
  username: 'KingOfBoos',
  rating: 1638,
  wins: 121,
  losses: 64
}, {
  username: 'Roeming',
  rating: 1542,
  wins: 98,
  losses: 70
}, {
  username: 'GhostRunner',
  rating: 1484,
  wins: 88,
  losses: 71
}, {
  username: 'WarioWare',
  rating: 1439,
  wins: 76,
  losses: 68
}, {
  username: 'ShyGuyGod',
  rating: 1426,
  wins: 71,
  losses: 65
}, {
  username: 'DiddyDinger',
  rating: 1351,
  wins: 64,
  losses: 62
}, {
  username: 'BabyBomber',
  rating: 1276,
  wins: 55,
  losses: 60
}, {
  username: 'PlumberMain',
  rating: 1219,
  wins: 49,
  losses: 58
}, {
  username: 'NokiMain',
  rating: 1205,
  wins: 47,
  losses: 55
}];
const CHARACTERS = [{
  name: 'Mario',
  cls: 'Balance'
}, {
  name: 'Luigi',
  cls: 'Balance'
}, {
  name: 'Peach',
  cls: 'Technique'
}, {
  name: 'Daisy',
  cls: 'Balance'
}, {
  name: 'Yoshi',
  cls: 'Speed'
}, {
  name: 'DK',
  cls: 'Power'
}, {
  name: 'Diddy',
  cls: 'Speed'
}, {
  name: 'Bowser',
  cls: 'Power'
}, {
  name: 'Bowser Jr',
  cls: 'Power'
}, {
  name: 'Wario',
  cls: 'Power'
}, {
  name: 'Boo',
  cls: 'Technique'
}, {
  name: 'King Boo',
  cls: 'Power'
}];
const CLASS_COLOR = {
  Balance: 'gray',
  Power: 'red',
  Speed: 'green',
  Technique: 'gold'
};
const BOX = {
  away: {
    user: 'DingerCity',
    score: 9,
    sprite: sprite('Mario'),
    batters: [{
      name: 'Mario',
      ab: 5,
      h: 3,
      hr: 2,
      rbi: 5,
      bb: 0,
      avg: '.600'
    }, {
      name: 'Peach',
      ab: 5,
      h: 2,
      hr: 0,
      rbi: 1,
      bb: 0,
      avg: '.400'
    }, {
      name: 'Yoshi',
      ab: 4,
      h: 2,
      hr: 0,
      rbi: 1,
      bb: 1,
      avg: '.500'
    }, {
      name: 'Toad(R)',
      ab: 4,
      h: 1,
      hr: 0,
      rbi: 1,
      bb: 0,
      avg: '.250'
    }, {
      name: 'Boo',
      ab: 4,
      h: 1,
      hr: 1,
      rbi: 1,
      bb: 0,
      avg: '.250'
    }],
    pitchers: [{
      name: 'Mario',
      ip: '7.0',
      h: 6,
      r: 4,
      k: 9,
      bb: 2,
      era: '5.14'
    }]
  },
  home: {
    user: 'JoeBaseball',
    score: 4,
    sprite: sprite('Bowser'),
    batters: [{
      name: 'Bowser',
      ab: 5,
      h: 2,
      hr: 1,
      rbi: 2,
      bb: 0,
      avg: '.400'
    }, {
      name: 'DK',
      ab: 4,
      h: 1,
      hr: 1,
      rbi: 2,
      bb: 1,
      avg: '.250'
    }, {
      name: 'Wario',
      ab: 4,
      h: 1,
      hr: 0,
      rbi: 0,
      bb: 0,
      avg: '.250'
    }, {
      name: 'Bowser Jr',
      ab: 4,
      h: 0,
      hr: 0,
      rbi: 0,
      bb: 0,
      avg: '.000'
    }, {
      name: 'Magikoopa(R)',
      ab: 3,
      h: 1,
      hr: 0,
      rbi: 0,
      bb: 1,
      avg: '.333'
    }],
    pitchers: [{
      name: 'Bowser',
      ip: '7.0',
      h: 9,
      r: 9,
      k: 4,
      bb: 2,
      era: '11.57'
    }]
  }
};
const BAT_COLS = [{
  key: 'name',
  label: 'Batters'
}, {
  key: 'ab',
  label: 'AB'
}, {
  key: 'h',
  label: 'H'
}, {
  key: 'hr',
  label: 'HR'
}, {
  key: 'rbi',
  label: 'RBI'
}, {
  key: 'bb',
  label: 'BB'
}, {
  key: 'avg',
  label: 'AVG',
  align: 'right'
}];
const PITCH_COLS = [{
  key: 'name',
  label: 'Pitchers'
}, {
  key: 'ip',
  label: 'IP'
}, {
  key: 'h',
  label: 'H'
}, {
  key: 'r',
  label: 'R'
}, {
  key: 'k',
  label: 'K'
}, {
  key: 'bb',
  label: 'BB'
}, {
  key: 'era',
  label: 'ERA',
  align: 'right'
}];

/* ----------------------------- nav ----------------------------- */
const NAV = ['Home', 'Ranked', 'Characters', 'Box Score'];
function Nav({
  route,
  setRoute,
  user,
  onLogin
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--border-card)',
      background: 'rgb(7 7 11 / 0.9)',
      backdropFilter: 'blur(8px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      height: 'var(--nav-height)',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: '0 24px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => setRoute('Home'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${A}/logos/mushroom.png`,
    width: "36",
    height: "36",
    className: "pixelated",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)'
    }
  }, "Project", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--rio-500)'
    }
  }, "Rio"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      flex: 1
    }
  }, NAV.map(item => {
    const active = route === item;
    return /*#__PURE__*/React.createElement("a", {
      key: item,
      onClick: () => setRoute(item),
      style: {
        padding: '8px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wider)',
        color: active ? 'var(--rio-400)' : 'var(--fog-300)'
      }
    }, item);
  })), /*#__PURE__*/React.createElement("a", {
    onClick: () => setRoute('Box Score'),
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(LiveLabel, null, "2 Live")), user ? /*#__PURE__*/React.createElement("a", {
    onClick: () => setRoute('Ranked'),
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: user
  })) : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: onLogin
  }, "Log In")));
}

/* ----------------------------- screens ----------------------------- */
function HomeScreen({
  setRoute
}) {
  const features = [{
    t: 'Ranked Ladders',
    d: 'Climb from Shell to Legend in seasonal ranked play with full ELO tracking.',
    go: 'Ranked'
  }, {
    t: 'Player Stats',
    d: 'Every at-bat and every pitch recorded. Batting, pitching, and matchup history.',
    go: 'Box Score'
  }, {
    t: 'Character Stats',
    d: 'Community-wide performance for all 54 characters — find your roster edge.',
    go: 'Characters'
  }, {
    t: 'Tools & Visualizers',
    d: 'Pitch trajectory calculator, stream overlays, and more for players and casters.',
    go: 'Ranked'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 64
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-2xl)',
      border: '1px solid var(--border-card)',
      background: 'var(--surface-card)',
      padding: '72px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: 'var(--wash-hero), repeating-linear-gradient(135deg, transparent 0 40px, rgb(255 255 255 / 0.015) 40px 41px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 760,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${A}/logos/mushroom.png`,
    width: "96",
    height: "96",
    className: "pixelated",
    alt: ""
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: 24,
      fontSize: 'var(--text-6xl)',
      textTransform: 'uppercase',
      lineHeight: 1.05
    }
  }, "Competitive ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--rio-500)'
    }
  }, "Mario Superstar Baseball")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '16px auto 0',
      maxWidth: 560,
      fontSize: 'var(--text-lg)',
      color: 'var(--fog-300)'
    }
  }, "Online ranked play, live game tracking, and deep stats for the Mario Superstar Baseball community \u2014 powered by Project Rio."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    icon: `${A}/icons/baseball-bat.png`
  }, "Get Project Rio"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setRoute('Ranked')
  }, "View Ladders"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setRoute('Box Score')
  }, "Watch Live")))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "kicker"
  }, "Around the league"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 4,
      fontSize: 'var(--text-3xl)',
      textTransform: 'uppercase'
    }
  }, "Latest Games")), /*#__PURE__*/React.createElement("a", {
    onClick: () => setRoute('Box Score'),
    className: "kicker",
    style: {
      cursor: 'pointer',
      color: 'var(--rio-400)'
    }
  }, "All Games \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16
    }
  }, GAMES.map((g, i) => /*#__PURE__*/React.createElement(GameScoreCard, _extends({
    key: i
  }, g, {
    onBoxScore: () => setRoute('Box Score')
  }))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("p", {
    className: "kicker"
  }, "Everything tracked"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '4px 0 24px',
      fontSize: 'var(--text-3xl)',
      textTransform: 'uppercase'
    }
  }, "Explore Project Rio"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16
    }
  }, features.map(f => /*#__PURE__*/React.createElement("a", {
    key: f.t,
    onClick: () => setRoute(f.go),
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    glow: true,
    style: {
      padding: 20,
      height: '100%',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, f.t), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 'var(--text-sm)',
      color: 'var(--fog-500)'
    }
  }, f.d), /*#__PURE__*/React.createElement("span", {
    className: "kicker",
    style: {
      display: 'inline-block',
      marginTop: 16,
      color: 'var(--rio-400)'
    }
  }, "Open \u2192")))))));
}
function RankedScreen() {
  const [mode, setMode] = useState('Standard');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    kicker: "Ranked play",
    title: "Standard Ladder"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 200
    }
  }, /*#__PURE__*/React.createElement(Select, {
    value: mode,
    onChange: e => setMode(e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "Standard"), /*#__PURE__*/React.createElement("option", null, "Big Balls Brawl"), /*#__PURE__*/React.createElement("option", null, "Star Mode")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(LadderTable, {
    rows: LADDER,
    highlightUser: "Roeming"
  })), /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(PanelHeader, {
    title: "Season 4",
    action: /*#__PURE__*/React.createElement(Badge, {
      color: "red"
    }, "Live")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Ranked players",
    value: "1,284"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Games this season",
    value: "18,402"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Top tier",
    value: /*#__PURE__*/React.createElement(TierBadge, {
      tier: "Legend I"
    })
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Ends in",
    value: "11 days"
  })))));
}
function Stat({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--fog-500)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--fog-100)'
    }
  }, value));
}
function CharactersScreen() {
  const [filter, setFilter] = useState('All');
  const classes = ['All', 'Balance', 'Power', 'Speed', 'Technique'];
  const shown = filter === 'All' ? CHARACTERS : CHARACTERS.filter(c => c.cls === filter);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    kicker: "Roster",
    title: "Characters"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, classes.map(c => /*#__PURE__*/React.createElement(Button, {
    key: c,
    size: "sm",
    variant: filter === c ? 'primary' : 'secondary',
    onClick: () => setFilter(c)
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16
    }
  }, shown.map(c => /*#__PURE__*/React.createElement(Panel, {
    key: c.name,
    glow: true,
    style: {
      padding: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: sprite(c.name),
    width: "52",
    height: "52",
    style: {
      objectFit: 'contain',
      imageRendering: 'pixelated',
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-md)',
      padding: 2
    },
    alt: c.name
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      textTransform: 'uppercase'
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    color: CLASS_COLOR[c.cls]
  }, c.cls)))))));
}
function BoxScoreScreen() {
  const homeWon = BOX.home.score > BOX.away.score;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      position: 'relative',
      overflow: 'hidden',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: 'radial-gradient(ellipse 70% 120% at 50% -20%, rgb(230 0 18 / 0.18), transparent)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(TeamScore, {
    team: BOX.away,
    won: !homeWon,
    align: "left"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      color: 'var(--fog-500)'
    }
  }, "Final"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    color: "red"
  }, "Big Balls Brawl"))), /*#__PURE__*/React.createElement(TeamScore, {
    team: BOX.home,
    won: homeWon,
    align: "right"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24
    }
  }, [BOX.away, BOX.home].map((t, i) => /*#__PURE__*/React.createElement(Panel, {
    key: i
  }, /*#__PURE__*/React.createElement(PanelHeader, {
    title: `${t.user} (${i === 0 ? 'Away' : 'Home'})`
  }), /*#__PURE__*/React.createElement(StatTable, {
    rowKey: "name",
    columns: BAT_COLS,
    rows: t.batters
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-card)'
    }
  }, /*#__PURE__*/React.createElement(StatTable, {
    rowKey: "name",
    columns: PITCH_COLS,
    rows: t.pitchers
  }))))));
}
function TeamScore({
  team,
  won,
  align
}) {
  const right = align === 'right';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexDirection: right ? 'row-reverse' : 'row',
      textAlign: right ? 'right' : 'left'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: team.sprite,
    width: "64",
    height: "64",
    style: {
      objectFit: 'contain',
      imageRendering: 'pixelated'
    },
    alt: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 700
    }
  }, team.user)), /*#__PURE__*/React.createElement("span", {
    style: {
      [right ? 'marginRight' : 'marginLeft']: 'auto',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-5xl)',
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      color: won ? 'var(--fog-100)' : 'var(--fog-500)'
    }
  }, team.score));
}

/* ----------------------------- footer ----------------------------- */
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: 64,
      borderTop: '1px solid var(--border-card)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '32px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${A}/logos/mushroom.png`,
    width: "28",
    height: "28",
    className: "pixelated",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)'
    }
  }, "Project", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--rio-500)'
    }
  }, "Rio"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      fontSize: 'var(--text-sm)',
      color: 'var(--fog-500)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Discord"), /*#__PURE__*/React.createElement("span", null, "Patreon"), /*#__PURE__*/React.createElement("span", null, "GitHub"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-hairline)',
      padding: '14px',
      textAlign: 'center',
      fontSize: 'var(--text-xs)',
      color: 'var(--fog-500)'
    }
  }, "Project Rio is a fan project and is not affiliated with Nintendo."));
}

/* ----------------------------- app ----------------------------- */
function App() {
  const [route, setRoute] = useState('Home');
  const [user, setUser] = useState(null);
  const screens = {
    Home: /*#__PURE__*/React.createElement(HomeScreen, {
      setRoute: setRoute
    }),
    Ranked: /*#__PURE__*/React.createElement(RankedScreen, null),
    Characters: /*#__PURE__*/React.createElement(CharactersScreen, null),
    'Box Score': /*#__PURE__*/React.createElement(BoxScoreScreen, null)
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(Nav, {
    route: route,
    setRoute: setRoute,
    user: user,
    onLogin: () => setUser('DingerCity')
  }), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, screens[route]), /*#__PURE__*/React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/app.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.LiveDot = __ds_scope.LiveDot;

__ds_ns.LiveLabel = __ds_scope.LiveLabel;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.PanelHeader = __ds_scope.PanelHeader;

__ds_ns.TierBadge = __ds_scope.TierBadge;

__ds_ns.GameScoreCard = __ds_scope.GameScoreCard;

__ds_ns.LadderTable = __ds_scope.LadderTable;

__ds_ns.PageHeader = __ds_scope.PageHeader;

__ds_ns.StatTable = __ds_scope.StatTable;

})();
