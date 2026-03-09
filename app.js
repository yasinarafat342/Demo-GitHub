const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";

document.addEventListener("DOMContentLoaded", () => {
  loadData("all");
});


async function loadData(category = "all") {
  const loader = document.getElementById("loader");
  const container = document.getElementById("issueContainer");
  const stats = document.getElementById("issueStats");

  if (loader) loader.classList.remove("hidden");
  if (container) container.innerHTML = "";

  updateTabUI(category);

  try {
    const response = await fetch(`${API_BASE}/issues`);
    if (!response.ok) throw new Error("API request failed");

    const result = await response.json();
    const issues = Array.isArray(result) ? result : result.data || [];


    let filtered = category === "all" ? issues : issues.filter((item) => item.status === category);

    if (stats) stats.innerText = `${filtered.length} Issues Found`;

    renderCards(filtered);
  } catch (error) {
    console.error("Error:", error);
    if (container) container.innerHTML = `<p class="col-span-4 text-center text-red-500">Failed to load data!</p>`;
  } finally {

    if (loader) loader.classList.add("hidden");
  }
}

function renderCards(issues) {
  const container = document.getElementById("issueContainer");

  if (!issues || issues.length === 0) {
    container.innerHTML = `<p class="col-span-4 text-center text-gray-400">No data found</p>`;
    return;
  }

  container.innerHTML = issues.map((issue) => {
      const borderClass = issue.status === "open" ? "border-green-500" : "border-purple-500";

      return `
      <div onclick="openModal(${issue.id})" 
           class="bg-white border-t-4 ${borderClass} p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full">
        
        <div class="mb-4">
          <h4 class="font-bold text-gray-900 mb-2 line-clamp-1">${issue.title}</h4>
          <p class="text-gray-500 text-xs line-clamp-2">${issue.description}</p>
        </div>

        <div class="space-y-3 mt-auto">
          <div class="flex justify-between items-center text-[11px] text-gray-600 font-medium">
             <span>👤 ${issue.author}</span>
             <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-700">🔥 ${issue.priority}</span>
          </div>

          <div class="pt-3 border-t border-gray-100 flex justify-between items-center">
            <span class="px-2 py-1 bg-blue-50 text-blue-600 font-bold uppercase rounded text-[10px]">
              ${issue.label}
            </span>
            <span class="text-gray-400 text-[10px]">
              ${new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      `;
    }).join("");
}

async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const loader = document.getElementById("loader");

  if (!query) return loadData("all");
  if (loader) loader.classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE}/issues/search?q=${query}`);
    const result = await res.json();
    const data = Array.isArray(result) ? result : result.data || [];

    renderCards(data);
    document.getElementById("issueStats").innerText = `${data.length} Results for "${query}"`;
  } catch (err) {
    console.error("Search failed:", err);
  } finally {
    if (loader) loader.classList.add("hidden");
  }
}

function updateTabUI(status) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active-tab");
  });
  const activeBtn = document.getElementById(`btn-${status}`);
  if (activeBtn) activeBtn.classList.add("active-tab");
}

async function openModal(id) {
  const modal = document.getElementById("issueModal");
  try {
    const res = await fetch(`${API_BASE}/issue/${id}`);
    const data = await res.json();
    const issue = data.data || data;

    document.getElementById("m-title").innerText = issue.title;
    document.getElementById("modalBody").innerHTML = `
      <p class="text-gray-600 mb-4">${issue.description}</p>
      <div class="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-lg">
        <p><strong>Author:</strong> ${issue.author}</p>
        <p><strong>Priority:</strong> ${issue.priority}</p>
        <p><strong>Status:</strong> ${issue.status}</p>
        <p><strong>Label:</strong> ${issue.label}</p>
      </div>
    `;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  } catch (err) { console.error(err); }
}

function closeModal() {
  const modal = document.getElementById("issueModal");
  modal.classList.add("hidden");
}