/**
 * 轻量级零依赖 Markdown 解析器（支持自动目录 TOC、表格、代码块与 LaTeX 公式保护）
 */
(function (global) {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizeUrl(url) {
    const trimmed = String(url || "").trim();
    if (/^(https?:|mailto:|\/|\.\/|\.\.\/|#|images\/)/i.test(trimmed)) {
      return trimmed;
    }
    return "#";
  }

  function formatInline(text) {
    const protectedSlots = [];
    // 1. 保护行内代码
    let processed = escapeHtml(text).replace(/`([^`]+)`/g, function (_, code) {
      const idx = protectedSlots.length;
      protectedSlots.push("<code>" + code + "</code>");
      return "\u0000SLOT" + idx + "\u0000";
    });

    // 2. 保护行内 LaTeX 公式 $...$（避免下划线或乘号被误解析为斜体）
    processed = processed.replace(/\$([^$\n]+)\$/g, function (match) {
      const idx = protectedSlots.length;
      protectedSlots.push(match);
      return "\u0000SLOT" + idx + "\u0000";
    });

    // 3. 图片与链接
    processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, src) {
      return '<img src="' + sanitizeUrl(src) + '" alt="' + alt + '" loading="lazy">';
    });

    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      const safeHref = sanitizeUrl(href);
      const isExternal = /^https?:/i.test(safeHref);
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a href="' + safeHref + '"' + attrs + ">" + label + "</a>";
    });

    // 4. 强调与删除线
    processed = processed.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    processed = processed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    processed = processed.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    // 5. 还原受保护的代码与公式
    processed = processed.replace(/\u0000SLOT(\d+)\u0000/g, function (_, i) {
      return protectedSlots[Number(i)] || "";
    });

    return processed;
  }

  function highlightCode(rawCode, lang) {
    const normalized = String(lang || "").toLowerCase();
    const isCStyle = /^(cpp|c\+\+|cc|c|js|javascript|ts)$/.test(normalized);
    if (!isCStyle) return escapeHtml(rawCode);

    const keywords = new Set([
      "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
      "return", "struct", "class", "public", "private", "using", "namespace",
      "const", "static", "inline", "signed", "unsigned", "void", "bool", "true",
      "false", "nullptr", "null", "undefined", "function", "let", "var", "new",
      "import", "export", "async", "await", "try", "catch", "sizeof", "typedef"
    ]);
    const types = new Set([
      "int", "long", "double", "float", "char", "string", "ll", "std", "ios",
      "vector", "queue", "stack", "deque", "map", "set", "pair", "cin", "cout",
      "endl", "min", "max", "sort", "INF", "inf"
    ]);

    const tokenRe = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(^[ \t]*#[a-zA-Z_][^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(\d+(?:\.\d+)?(?:LL|ll|ULL|ull|f)?)\b|\b([A-Za-z_]\w*)\b/gm;
    let out = "";
    let lastIndex = 0;
    let m;

    while ((m = tokenRe.exec(rawCode)) !== null) {
      if (m.index > lastIndex) {
        out += escapeHtml(rawCode.slice(lastIndex, m.index));
      }
      const full = m[0];
      if (m[1]) {
        out += '<span class="tok-com">' + escapeHtml(full) + "</span>";
      } else if (m[2]) {
        out += '<span class="tok-prep">' + escapeHtml(full) + "</span>";
      } else if (m[3]) {
        out += '<span class="tok-str">' + escapeHtml(full) + "</span>";
      } else if (m[4]) {
        out += '<span class="tok-num">' + escapeHtml(full) + "</span>";
      } else if (m[5]) {
        if (keywords.has(full)) {
          out += '<span class="tok-kw">' + escapeHtml(full) + "</span>";
        } else if (types.has(full)) {
          out += '<span class="tok-type">' + escapeHtml(full) + "</span>";
        } else {
          out += escapeHtml(full);
        }
      }
      lastIndex = tokenRe.lastIndex;
    }

    if (lastIndex < rawCode.length) {
      out += escapeHtml(rawCode.slice(lastIndex));
    }
    return out;
  }

  function parseTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map(function (cell) { return cell.trim(); });
  }

  function parseMarkdownWithToc(markdownText) {
    if (!markdownText) return { html: "", toc: [] };
    const lines = String(markdownText).replace(/\r\n?/g, "\n").split("\n");
    const html = [];
    const toc = [];
    let headingCounter = 0;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. 围栏代码块
      const fenceMatch = line.match(/^```(\w*)\s*$/);
      if (fenceMatch) {
        const lang = fenceMatch[1] || "text";
        const codeLines = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        i++;
        html.push(
          '<div class="code-block">' +
            '<div class="code-block-header">' +
              '<span class="code-lang">' + escapeHtml(lang) + "</span>" +
              '<button type="button" class="code-copy-btn" data-copy-code>复制代码</button>' +
            "</div>" +
            "<pre><code>" + highlightCode(codeLines.join("\n"), lang) + "</code></pre>" +
          "</div>"
        );
        continue;
      }

      if (/^\s*$/.test(line)) {
        i++;
        continue;
      }

      // 2. 分割线
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        html.push("<hr>");
        i++;
        continue;
      }

      // 3. 表格
      if (
        line.includes("|") &&
        i + 1 < lines.length &&
        /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1])
      ) {
        const headers = parseTableRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes("|") && !/^\s*$/.test(lines[i])) {
          rows.push(parseTableRow(lines[i]));
          i++;
        }
        const thead = "<thead><tr>" + headers.map(function (h) {
          return "<th>" + formatInline(h) + "</th>";
        }).join("") + "</tr></thead>";
        const tbody = "<tbody>" + rows.map(function (r) {
          return "<tr>" + r.map(function (c) {
            return "<td>" + formatInline(c) + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody>";
        html.push('<div class="table-wrap"><table>' + thead + tbody + "</table></div>");
        continue;
      }

      // 4. 标题 # ~ ####
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const rawText = headingMatch[2].trim();
        const id = "sec-" + (++headingCounter);
        if (level === 2 || level === 3) {
          const cleanToc = rawText
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/[*_`~]/g, "");
          toc.push({ id: id, level: level, text: cleanToc });
        }
        html.push('<h' + level + ' id="' + id + '">' + formatInline(rawText) + "</h" + level + ">");
        i++;
        continue;
      }

      // 5. 引用块
      if (/^\s*>\s?/.test(line)) {
        const quoteLines = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html.push("<blockquote><p>" + quoteLines.map(formatInline).join("<br>") + "</p></blockquote>");
        continue;
      }

      // 6. 无序列表
      if (/^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          items.push("<li>" + formatInline(lines[i].replace(/^\s*[-*+]\s+/, "")) + "</li>");
          i++;
        }
        html.push("<ul>" + items.join("") + "</ul>");
        continue;
      }

      // 7. 有序列表
      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          items.push("<li>" + formatInline(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>");
          i++;
        }
        html.push("<ol>" + items.join("") + "</ol>");
        continue;
      }

      // 8. 普通段落
      const paraLines = [];
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^```/.test(lines[i]) &&
        !/^(#{1,4})\s+/.test(lines[i]) &&
        !/^\s*>\s?/.test(lines[i]) &&
        !/^\s*[-*+]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i]) &&
        !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
      ) {
        paraLines.push(formatInline(lines[i].trim()));
        i++;
      }
      if (paraLines.length > 0) {
        html.push("<p>" + paraLines.join("<br>") + "</p>");
      }
    }

    return { html: html.join("\n"), toc: toc };
  }

  function estimateReadingStats(markdownText) {
    const plain = String(markdownText || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#>*`_\-\[\]()]/g, " ")
      .replace(/\s+/g, "");
    const chars = plain.length;
    const minutes = Math.max(1, Math.round(chars / 320));
    return { chars: chars, minutes: minutes };
  }

  global.parseMarkdownWithToc = parseMarkdownWithToc;
  global.estimateReadingStats = estimateReadingStats;
  global.renderMarkdown = function (md) {
    return parseMarkdownWithToc(md).html;
  };
})(window);
