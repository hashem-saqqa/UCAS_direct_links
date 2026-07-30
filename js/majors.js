(function () {
  "use strict";

  var API_BASE = "https://api.ucas.edu.ps/site/deans_dept/";
  var JOIN_BASE = "https://join.ucas.edu.ps/major";

  var LEVELS = {
    "10": {
      pageTitle: "برامج البكالوريوس",
      cardClass: "major-card--bachelor",
      badgeText: "بكالوريوس",
      icon:
        '<path d="M2 9 12 4l10 5-10 5-10-5Z"/><path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 9v6"/>'
    },
    "20": {
      pageTitle: "برامج الدبلوم",
      cardClass: "major-card--diploma",
      badgeText: "دبلوم",
      icon:
        '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>'
    },
    "30": {
      pageTitle: "برامج الدبلوم المهني",
      cardClass: "major-card--vocational",
      badgeText: "دبلوم مهني",
      icon:
        '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="13" x2="21" y2="13"/>'
    }
  };

  var params = new URLSearchParams(window.location.search);
  var level = params.get("level");
  var config = LEVELS[level];

  var contentEl = document.getElementById("content");
  var pageTitleEl = document.getElementById("page-title");
  var pageTitleTagEl = document.getElementById("page-title-tag");

  if (!config) {
    showMessage("لم يتم تحديد المستوى الدراسي بشكل صحيح.", true);
    return;
  }

  pageTitleEl.textContent = config.pageTitle;
  pageTitleTagEl.textContent = config.pageTitle + " | الكلية الجامعية للعلوم التطبيقية";

  fetchMajors(level);

  function fetchMajors(level) {
    fetch(API_BASE + "?studylevel=" + encodeURIComponent(level))
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        renderDeans(data && data.deans ? data.deans : []);
      })
      .catch(function (err) {
        console.error(err);
        showMessage("تعذر تحميل البرامج حاليًا. الرجاء المحاولة لاحقًا.", true);
      });
  }

  function showMessage(text, isError) {
    contentEl.innerHTML = "";
    var p = document.createElement("p");
    p.className = "state-message" + (isError ? " error" : "");
    p.textContent = text;
    contentEl.appendChild(p);
  }

  function renderDeans(deans) {
    contentEl.innerHTML = "";

    if (!deans.length) {
      showMessage("لا توجد برامج متاحة لهذا المستوى حاليًا.", false);
      return;
    }

    deans.forEach(function (dean) {
      var mainDepts = (dean.main_depts || []).filter(function (md) {
        return (md.depts || []).length > 0;
      });
      if (!mainDepts.length) return;

      var section = document.createElement("section");
      section.className = "dean-section";

      var deanTitle = document.createElement("h2");
      deanTitle.className = "dean-title";
      deanTitle.textContent = dean.dean_name || "";
      if (dean.color) {
        deanTitle.style.setProperty("--accent", dean.color);
      }
      section.appendChild(deanTitle);

      mainDepts.forEach(function (mainDept) {
        var deptBlock = document.createElement("div");
        deptBlock.className = "department-block";

        var deptTitle = document.createElement("h3");
        deptTitle.className = "department-title";
        deptTitle.textContent = mainDept.department_name || "";
        deptBlock.appendChild(deptTitle);

        var list = document.createElement("div");
        list.className = "majors-list";

        mainDept.depts.forEach(function (major) {
          list.appendChild(buildMajorCard(dean, mainDept, major));
        });

        deptBlock.appendChild(list);
        section.appendChild(deptBlock);
      });

      contentEl.appendChild(section);
    });

    if (!contentEl.children.length) {
      showMessage("لا توجد برامج متاحة لهذا المستوى حاليًا.", false);
    }
  }

  function buildMajorCard(dean, mainDept, major) {
    var isClosed = major.coordination_key_male === null || major.coordination_key_male === undefined || major.coordination_key_male === "";

    var card = document.createElement("div");
    card.className = "major-card " + config.cardClass + (isClosed ? " is-closed" : "");

    var iconWrap = document.createElement("div");
    iconWrap.className = "icon-wrap";
    iconWrap.innerHTML = '<svg class="icon" viewBox="0 0 24 24">' + config.icon + "</svg>";
    card.appendChild(iconWrap);

    var body = document.createElement("div");
    body.className = "major-card__body";

    var badge = document.createElement("span");
    badge.className = "major-card__badge";
    badge.textContent = config.badgeText;
    body.appendChild(badge);

    var title = document.createElement("h4");
    title.className = "major-card__title";
    title.textContent = major.department_name || "";
    body.appendChild(title);

    var pills = document.createElement("div");
    pills.className = "major-card__pills";
    if (major.study_length_name) {
      pills.appendChild(makePill(major.study_length_name.trim()));
    }
    if (major.study_hours_count) {
      pills.appendChild(makePill(major.study_hours_count + " ساعة"));
    }
    if (!isClosed && major.coordination_key) {
      pills.appendChild(makePill(major.coordination_key.trim()));
    }
    body.appendChild(pills);

    card.appendChild(body);

    var action = document.createElement("div");
    action.className = "major-card__action";

    if (isClosed) {
      var closedBadge = document.createElement("span");
      closedBadge.className = "badge--closed";
      closedBadge.textContent = "التخصص مغلق حاليًا";
      action.appendChild(closedBadge);

      var disabledBtn = document.createElement("button");
      disabledBtn.className = "btn btn--disabled";
      disabledBtn.type = "button";
      disabledBtn.disabled = true;
      disabledBtn.textContent = "تفاصيل التخصص";
      action.appendChild(disabledBtn);
    } else {
      var link = document.createElement("a");
      link.className = "btn " + colorClass(level);
      link.href = buildJoinLink(dean, mainDept, major);
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "تفاصيل التخصص";
      action.appendChild(link);
    }

    card.appendChild(action);
    return card;
  }

  function makePill(text) {
    var pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = text;
    return pill;
  }

  function colorClass(level) {
    if (level === "10") return "btn--green";
    if (level === "20") return "btn--blue";
    return "btn--orange";
  }

  function buildJoinLink(dean, mainDept, major) {
    return [
      JOIN_BASE,
      encodeURIComponent(dean.route_name),
      encodeURIComponent(mainDept.route_name),
      encodeURIComponent(mainDept.department_no),
      encodeURIComponent(major.department_no),
      encodeURIComponent(major.route_name)
    ].join("/");
  }
})();
