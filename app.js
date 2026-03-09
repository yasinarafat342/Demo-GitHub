// ১. API Base URL
const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";

// ২. পেজ লোড হওয়ার সাথে সাথে ডেটা আনা শুরু হবে
document.addEventListener("DOMContentLoaded", () => {
    loadData("all");
});

// ৩. মেইন ডেটা লোড ফাংশন
async function loadData(category = "all") {
    const loader = document.getElementById("loader");
    const container = document.getElementById("issueContainer");
    const stats = document.getElementById("issueStats");

    // শুরুতে লোডার দেখানো এবং কন্টেইনার খালি করা (Loading spinner on data load)
    if (loader) loader.classList.remove("hidden");
    if (container) container.innerHTML = ""; 

    // ট্যাব এর ইউআই আপডেট করা (Show active button)
    updateTabUI(category);

    try {
        const response = await fetch(`${API_BASE}/issues`);
        
        if (!response.ok) throw new Error("API request failed");
        
        const result = await response.json();

        // এরর ফিক্স: এপিআই ডাটা অবজেক্ট বা অ্যারে যাই হোক না কেন তা হ্যান্ডেল করা
        const issues = Array.isArray(result) ? result : (result.data || []);

        // ক্যাটাগরি অনুযায়ী ফিল্টার (All, Open, or Closed)
        let filtered = issues;
        if (category !== "all") {
            filtered = issues.filter(item => item.status === category);
        }

        // কয়টি ইস্যু পাওয়া গেল তা দেখানো (Fix: undefined issue)
        if (stats) stats.innerText = `${filtered.length} Issues Found`;

        // কার্ডগুলো স্ক্রিনে রেন্ডার করা
        renderCards(filtered);

    } catch (error) {
        console.error("Data loading error:", error);
        if (container) {
            container.innerHTML = `<p class="text-red-500 text-center col-span-4 font-bold">Failed to load data! Please try again.</p>`;
        }
    } finally {
        // লোডার লুকানো (এটি মাস্ট রান করবে)
        if (loader) loader.classList.add("hidden");
    }
}

// ৪. ইস্যু কার্ড রেন্ডার করা (README রিকোয়ারমেন্ট অনুযায়ী)
function renderCards(issues) {
    const container = document.getElementById("issueContainer");
    
    if (!Array.isArray(issues) || issues.length === 0) {
        container.innerHTML = `<p class="col-span-4 text-center text-gray-400 py-10">No issues found matching your criteria.</p>`;
        return;
    }

    container.innerHTML = issues.map(issue => {
        // রিকোয়ারমেন্ট: ওপেন হলে গ্রিন, ক্লোজড হলে পার্পল/ম্যাজেন্টা বর্ডার
        const borderClass = issue.status === "open" ? "border-green-500" : "border-[#4f46e5]"; 
        
        return `
            <div onclick="openModal(${issue.id})" 
                 class="bg-white border-t-4 ${borderClass} p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full group">
                <div>
                    <h4 class="font-bold text-gray-900 mb-2 group-hover:text-[#4f46e5] transition line-clamp-1">
                        ${issue.title || "No Title Provided"}
                    </h4>
                    <p class="text-gray-500 text-xs mb-4 line-clamp-2">
                        ${issue.description || "No description available for this issue."}
                    </p>
                </div>
                <div class="mt-auto pt-4 border-t border-gray-100">
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="px-2 py-1 bg-gray-100 font-bold uppercase rounded text-gray-600">
                            ${issue.label || "General"}
                        </span>
                        <span class="text-gray-400">
                            ${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                    </div>
                    <div class="mt-2 text-[10px] text-gray-500 font-medium">
                        👤 Author: ${issue.author || "Unknown"}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// ৫. সার্চ ফাংশন (Implement Search Functionality)
async function handleSearch() {
    const searchInput = document.getElementById("searchInput");
    const query = searchInput.value.trim();
    const loader = document.getElementById("loader");
    const stats = document.getElementById("issueStats");

    if (!query) return loadData("all");

    if (loader) loader.classList.remove("hidden");

    try {
        const res = await fetch(`${API_BASE}/issues/search?q=${query}`);
        const result = await res.json();
        const data = Array.isArray(result) ? result : (result.data || []);

        renderCards(data);
        if (stats) stats.innerText = `${data.length} Results for "${query}"`;
    } catch (err) {
        console.error("Search error:", err);
    } finally {
        if (loader) loader.classList.add("hidden");
    }
}

// ৬. ট্যাব ইউআই হাইলাইট (Show active button)
function updateTabUI(status) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active-tab");
        // অতিরিক্ত: ম্যাজেন্টা থিমের জন্য বর্ডার বা কালার কাস্টমাইজ করতে পারেন
    });
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

        document.getElementById("m-title").innerText = data.title || "Issue Details";

        modalBody.innerHTML = `
            <div class="space-y-4">
                <p class="text-gray-700 leading-relaxed">${data.description || "No detailed description available."}</p>
                <div class="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p><strong>👤 Author:</strong> ${data.author || "Unknown"}</p>
                    <p><strong>🚦 Status:</strong> <span class="capitalize">${data.status || "N/A"}</span></p>
                    <p><strong>🔥 Priority:</strong> ${data.priority || "Normal"}</p>
                    <p><strong>🏷️ Label:</strong> ${data.label || "General"}</p>
                </div>
            </div>
        `;

        modal.classList.remove("hidden");
        modal.classList.add("flex");
    } catch (err) {
        console.error("Modal error:", err);
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