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
        const issues = Array.isArray(result) ? result : (result.data || []);

        let filtered = issues;
        if (category !== "all") {
            filtered = issues.filter(item => item.status === category);
        }

        // 'Found' লেখাটি বাদ দেওয়া হয়েছে
        if (stats) stats.innerText = `${filtered.length} Issues`;

        renderCards(filtered);

    } catch (error) {
        console.error("Data loading error:", error);
        if (container) {
            container.innerHTML = `<p class="text-red-500 text-center col-span-4 font-bold">Failed to load data!</p>`;
        }
    } finally {
        if (loader) loader.classList.add("hidden");
    }
}

function renderCards(issues) {
    const container = document.getElementById("issueContainer");
    if (!Array.isArray(issues) || issues.length === 0) {
        container.innerHTML = `<p class="col-span-4 text-center text-gray-400 py-10">No issues found.</p>`;
        return;
    }

    container.innerHTML = issues.map(issue => {
        const borderClass = issue.status === "open" ? "border-green-500" : "border-[#4f46e5]"; 
        return `
            <div onclick="openModal(${issue.id})" 
                 class="bg-white border-t-4 ${borderClass} p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full group">
                <div>
                    <h4 class="font-bold text-gray-900 mb-2 group-hover:text-[#4f46e5] transition line-clamp-1">${issue.title}</h4>
                    <p class="text-gray-500 text-xs mb-4 line-clamp-2">${issue.description || "No description available."}</p>
                </div>
                <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-[10px]">
                    <span class="px-2 py-1 bg-gray-100 font-bold uppercase rounded text-gray-600">${issue.label || "General"}</span>
                    <span class="text-gray-400">${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
            </div>
        `;
    }).join("");
}

async function handleSearch() {
    const searchInput = document.getElementById("searchInput");
    const query = searchInput.value.trim();
    const stats = document.getElementById("issueStats");

    if (!query) return loadData("all");
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("hidden");

    try {
        const res = await fetch(`${API_BASE}/issues/search?q=${query}`);
        const result = await res.json();
        const data = Array.isArray(result) ? result : (result.data || []);
        renderCards(data);
        if (stats) stats.innerText = `${data.length} Issues`;
    } catch (err) { console.error(err); }
    finally { if (loader) loader.classList.add("hidden"); }
}

// বাটন কালার করার লজিক
function updateTabUI(status) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        // আগের সব কালার রিমুভ করা
        btn.classList.remove("bg-blue-600", "text-white", "border-blue-600", "active-tab");
        btn.classList.add("text-gray-500");
    });

    const activeBtn = document.getElementById(`btn-${status}`);
    if (activeBtn) {
        // একটিভ বাটনে নীল কালার দেওয়া
        activeBtn.classList.add("bg-blue-600", "text-white", "border-blue-600", "active-tab");
        activeBtn.classList.remove("text-gray-500");
    }
}

async function openModal(id) {
    const modal = document.getElementById("issueModal");
    const modalBody = document.getElementById("modalBody");
    try {
        const res = await fetch(`${API_BASE}/issue/${id}`);
        const issue = await res.json();
        const data = issue.data || issue;
        document.getElementById("m-title").innerText = data.title;
        modalBody.innerHTML = `<p class="text-gray-700">${data.description}</p>`;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    } catch (err) { console.error(err); }
}

function closeModal() {
    const modal = document.getElementById("issueModal");
    if (modal) { modal.classList.add("hidden"); modal.classList.remove("flex"); }
}