// Renders the validation status grid from validation-status.json.
// This is the single source of truth for body-map colors and evidence text —
// update the JSON as evidence moves from red -> amber -> green, not this file.

(function () {
  var FALLBACK = {
    zones: [
      { id: "mission", label: "Head / Crown", layer: "Mission layer", light: "none",
        items: ["Human-governed runtime authority for the autonomous era",
                "Pro-AI, pro-scale, pro-trust",
                "Autonomous systems should not become their own authority source"] },
      { id: "principle", label: "Chest / Core", layer: "Authority principle layer", light: "none",
        items: ["Bounded temporal authority", "Human-governed validation",
                "No machine self-extension", "Auditability and provenance"] },
      { id: "evidence", label: "Torso", layer: "Current validated evidence", light: "green",
        items: ["Level 6D local deterministic robotics/autonomy benchmark evidence",
                "Level 6E clean-tree provenance",
                "Level 7G local publication-readiness gating",
                "Pilot portal live",
                "Scenario Matrix and Audit Events browser-visible",
                "Static / no-JS / crawler evidence snapshot being hardened"] },
      { id: "fpga", label: "Spine / Lower torso", layer: "FPGA enforcement layer", light: "amber",
        items: ["Verified in RTL simulation and synthesis; physical-board validation pending",
                "Lease Enforcement Kernel", "QVN Structural Verifier",
                "Authenticated decision and persistent state",
                "Exact expiry and post-expiry capability denial",
                "Fresh authorization required for subsequent authority",
                "No automatic successor activation"] },
      { id: "next", label: "Hips / Upper legs", layer: "Next validation layer", light: "amber",
        items: ["Hosted Supabase evidence ingestion", "Authenticated reviewer portal",
                "Live-ingestion readiness checklist", "Pilot cohort operations",
                "Insurer / robotics / regulator review flow"] },
      { id: "frontier", label: "Lower legs / Feet", layer: "Real-world embodiment frontier", light: "red",
        items: ["No physical robotics or actuator system has been controlled by OCUP yet. FPGA RTL simulation and synthesis are underway; live KR260 board validation remains pending.",
                "No Optimus/Tesla hardware tested", "No live distributed validator network",
                "No production HSM signing", "No production enforcement claim"] }
    ]
  };

  function render(data) {
    var grid = document.getElementById("statusGrid");
    if (!grid) return;
    grid.innerHTML = "";

    data.zones.forEach(function (zone) {
      var card = document.createElement("article");
      card.className = "status-card";
      card.setAttribute("data-light", zone.light);
      card.setAttribute("data-zone", zone.id);

      var head = document.createElement("div");
      head.className = "status-card__head";
      var dot = document.createElement("span");
      dot.className = "status-card__dot";
      var label = document.createElement("span");
      label.className = "status-card__label";
      label.textContent = zone.label;
      head.appendChild(dot);
      head.appendChild(label);

      var layer = document.createElement("h3");
      layer.className = "status-card__layer";
      layer.textContent = zone.layer;

      var list = document.createElement("ul");
      list.className = "status-card__items";
      zone.items.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });

      card.appendChild(head);
      card.appendChild(layer);
      card.appendChild(list);
      grid.appendChild(card);
    });
  }

  function init() {
    fetch("validation-status.json")
      .then(function (res) {
        if (!res.ok) throw new Error("status fetch failed");
        return res.json();
      })
      .then(render)
      .catch(function () {
        // Local file:// testing (no server) falls back to inline data.
        render(FALLBACK);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
