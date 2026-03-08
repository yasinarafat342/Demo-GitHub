// ১. API Base URL (তোমার দেওয়া লিংক)
const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";

// ২. পেজ লোড হলে ডাটা লোড হবে
document.addEventListener("DOMContentLoaded", () => {
  loadData("all");
});

// ৩. মেইন ডাটা লোড ফাংশন
async function loadData(category = "all") {
  const loader = document.getElementById("loader");
  const container = document.getElementById("issueContainer");
  const stats = document.getElementById("issueStats");
  const tabIcon = document.getElementById("tabIcon");

  // শুরুতে লোডার দেখানো এবং কন্টেইনার খালি করা
  if (loader) loader.classList.remove("hidden");
  if (container) container.innerHTML = "";

  updateTabUI(category);

  try {
    const response = await fetch(`${API_BASE}/issues`);
    if (!response.ok) throw new Error("API request failed");

    const result = await response.json();
    const issues = Array.isArray(result) ? result : result.data || [];

    // ক্যাটাগরি অনুযায়ী ফিল্টার (Open/Closed)
    let filtered = category === "all" ? issues : issues.filter((item) => item.status === category);

    // Figma অনুযায়ী আইকন ও স্ট্যাটাস আপডেট
    if (stats) stats.innerText = `${filtered.length} Issues Found`;
    if (tabIcon) {
        tabIcon.src = category === 'closed' ? 'Closed- Status .png' : 'Open-Status.png';
    }

    renderCards(filtered);
  } catch (error) {
    console.error("Data loading error:", error);
    if (container) container.innerHTML = `<p class="text-red-500 text-center col-span-4 font-bold">Failed to load data!</p>`;
  } finally {
    if (loader) loader.classList.add("hidden");
  }
}

// ৪. কার্ড রেন্ডার (README রিকোয়ারমেন্ট অনুযায়ী সব তথ্যসহ)
function renderCards(issues) {
  const container = document.getElementById("issueContainer");

  if (!issues || issues.length === 0) {
    container.innerHTML = `<p class="col-span-4 text-center text-gray-400">No data found</p>`;
    return;
  }

  container.innerHTML = issues.map((issue) => {
      // Challenge: Open = Green Border, Closed = Purple Border
      const borderClass = issue.status === "open" ? "border-green-500" : "border-purple-500";

      return `
      <div onclick="openModal(${issue.id})" 
           class="bg-white border-t-4 ${borderClass} p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full group">
        
        <div>
          <h4 class="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">${issue.title}</h4>
          <p class="text-gray-500 text-xs mb-4 line-clamp-2">${issue.description}</p>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center text-[11px] text-gray-600">
             <span><strong>Author:</strong> ${issue.author}</span>
             <span class="bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-bold">${issue.priority}</span>
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

// ৫. সার্চ ফাংশন
async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const loader = document.getElementById("loader");
  const stats = document.getElementById("issueStats");

  if (!query) return loadData("all");
  if (loader) loader.classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE}/issues/search?q=${query}`);
    const result = await res.json();
    const data = Array.isArray(result) ? result : result.data || [];

    renderCards(data);
    if (stats) stats.innerText = `${data.length} Results for "${query}"`;
  } catch (err) {
    console.error("Search error:", err);
  } finally {
    if (loader) loader.classList.add("hidden");
  }
}

// ৬. ট্যাব হাইলাইট
function updateTabUI(status) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active-tab"));
  const activeBtn = document.getElementById(`btn-${status}`);
  if (activeBtn) activeBtn.classList.add("active-tab");
}

// ৭. মডাল ওপেন (Single Issue Details)
async function openModal(id) {
  const modal = document.getElementById("issueModal");
  const modalBody = document.getElementById("modalBody");

  try {
    const res = await fetch(`${API_BASE}/issue/${id}`);
    const issue = await res.json();
    const data = issue.data || issue;

    document.getElementById("m-title").innerText = data.title;

    modalBody.innerHTML = `
      <div class="space-y-4">
        <p class="text-gray-600 leading-relaxed">${data.description}</p>
        
        <div class="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p><strong>👤 Author:</strong> ${data.author}</p>
          <p><strong>🚦 Status:</strong> <span class="capitalize">${data.status}</span></p>
          <p><strong>🔥 Priority:</strong> ${data.priority}</p>
          <p><strong>🏷️ Label:</strong> ${data.label}</p>
          <p class="col-span-2"><strong>📅 Created At:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  } catch (err) {
    console.error(err);
  }
}

// ৮. মডাল ক্লোজ
function closeModal() {
  const modal = document.getElementById("issueModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}